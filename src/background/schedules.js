import {
  getBlockState,
  setScheduleBlocked,
  setSchedules
} from "./state.js";

import { normalizeBlockedUrls } from "./blocked-sites.js";

const DAY_COUNT = 7;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function timeToMinutes(time) {
  const match = TIME_PATTERN.exec(time);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
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

  return daysAreValid && start !== null && end !== null && start !== end;
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

  if (start < end) {
    return schedule.days.includes(currentDay) && current >= start && current < end;
  }

  const previousDay = (currentDay + DAY_COUNT - 1) % DAY_COUNT;

  return (schedule.days.includes(currentDay) && current >= start) || (schedule.days.includes(previousDay) && current < end);
}

export async function saveSchedules(schedules) {
  const normalizedSchedules = normalizeSchedules(schedules);

  if (!Array.isArray(schedules) || normalizedSchedules.length !== schedules.length) {
    throw new Error("Uno o più schedule non sono validi.");
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
