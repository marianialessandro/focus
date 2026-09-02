import {
  getBlockState,
  setScheduleBlocked,
  setSchedules
} from "./state.js";

import {
  isBlockedUrlCovered,
  normalizeBlockedUrls
} from "./blocked-sites.js";

const DAY_COUNT = 7;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function timeToMinutes(time) {
  const match = TIME_PATTERN.exec(time);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function isValidOptionalDate(value) {
  if (value === "") {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  const match = DATE_PATTERN.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function formatLocalDate(date) {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidSchedule(schedule) {
  if (!schedule || typeof schedule.id !== "string" || schedule.id.length > 100) {
    return false;
  }

  if (!Array.isArray(schedule.days) || schedule.days.length === 0) {
    return false;
  }

  const daysAreValid = schedule.days.every((day) => Number.isInteger(day) && day >= 0 && day < DAY_COUNT);
  const start = timeToMinutes(schedule.start);
  const end = timeToMinutes(schedule.end);
  const startDate = schedule.startDate ?? "";
  const endDate = schedule.endDate ?? "";
  const dateRangeIsValid = isValidOptionalDate(startDate) && isValidOptionalDate(endDate) && (!startDate || !endDate || startDate <= endDate);

  return daysAreValid && start !== null && end !== null && start !== end && dateRangeIsValid;
}

export function normalizeSchedules(schedules) {
  if (!Array.isArray(schedules)) {
    return [];
  }

  return schedules.filter(isValidSchedule).map((schedule) => ({
    id: schedule.id,
    name: typeof schedule.name === "string" ? schedule.name.trim().slice(0, 80) : "",
    days: [...new Set(schedule.days)].sort((first, second) => first - second),
    start: schedule.start,
    end: schedule.end,
    startDate: schedule.startDate || "",
    endDate: schedule.endDate || "",
    enabled: schedule.enabled !== false,
    additionalBlockedUrls: normalizeBlockedUrls(Array.isArray(schedule.additionalBlockedUrls) ? schedule.additionalBlockedUrls : []),
    excludedBlockedUrls: normalizeBlockedUrls(Array.isArray(schedule.excludedBlockedUrls) ? schedule.excludedBlockedUrls : [])
  }));
}

export function isScheduleActive(schedule, date = new Date()) {
  if (!schedule.enabled) {
    return false;
  }

  const start = timeToMinutes(schedule.start);
  const end = timeToMinutes(schedule.end);
  const current = date.getHours() * 60 + date.getMinutes();
  const currentDay = date.getDay();
  let occurrenceDate = null;

  if (start < end) {
    if (schedule.days.includes(currentDay) && current >= start && current < end) {
      occurrenceDate = date;
    }
  } else {
    const previousDay = (currentDay + DAY_COUNT - 1) % DAY_COUNT;

    if (schedule.days.includes(currentDay) && current >= start) {
      occurrenceDate = date;
    } else if (schedule.days.includes(previousDay) && current < end) {
      occurrenceDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    }
  }

  if (!occurrenceDate) {
    return false;
  }

  const occurrenceDateValue = formatLocalDate(occurrenceDate);

  return (!schedule.startDate || occurrenceDateValue >= schedule.startDate) && (!schedule.endDate || occurrenceDateValue <= schedule.endDate);
}

export async function saveSchedules(schedules) {
  const normalizedSchedules = normalizeSchedules(schedules);

  if (!Array.isArray(schedules) || normalizedSchedules.length !== schedules.length) {
    throw new Error("Uno o più schedule non sono validi.");
  }

  const state = await getBlockState();

  for (const schedule of normalizedSchedules) {
    const redundantUrl = schedule.additionalBlockedUrls.find((additionalUrl) => state.blockedUrls.some((blockedUrl) => isBlockedUrlCovered(additionalUrl, blockedUrl)));

    if (redundantUrl) {
      const scheduleName = schedule.name || `${schedule.start}–${schedule.end}`;
      throw new Error(`${redundantUrl} è già bloccato globalmente e non può essere aggiunto a “Blocca anche” nello schedule ${scheduleName}.`);
    }
  }

  await setSchedules(normalizedSchedules);

  return refreshScheduleState(normalizedSchedules);
}

export async function refreshScheduleState(knownSchedules = null) {
  const state = knownSchedules ? null : await getBlockState();
  const schedules = knownSchedules || normalizeSchedules(state.schedules);
  const activeSchedules = schedules.filter((schedule) => isScheduleActive(schedule));
  const activeSchedule = activeSchedules[0] || null;

  await setScheduleBlocked(Boolean(activeSchedule), activeSchedule, activeSchedules);

  return activeSchedules;
}
