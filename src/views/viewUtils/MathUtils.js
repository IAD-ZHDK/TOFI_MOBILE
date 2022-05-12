export function map(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export function constrain(num, min, max) {
  return Math.min(Math.max(num, min), max)
}

export function moveingWeightedAverageArray(newValues, averageValues, filters) {
  // apply filtering
  for (let i = 0; i < newValues.length; i++) {
    averageValues[i] = moveingWeightedAverage(newValues[i], averageValues[i], filters[i])
  }
  return averageValues;
}

export function moveingWeightedAverage(newValue, averageValue, filter) {
  // apply filtering
  if (filter > 0) {
    averageValue = Math.floor(averageValue * filter)
    averageValue += Math.floor(newValue * (1.0 - filter))
  } else {
    averageValue = newValue
  }
  return averageValue;
}

export function moveingWeightedAverageFloat(newValue, averageValue, filter) {
  // apply filtering
  //  console.log(newValue+" "+averageValue+" "+filter);
  if (filter > 0.0001) {
    averageValue = averageValue * filter
    averageValue += newValue * (1.0 - filter)
  } else {
    averageValue = newValue
  }
  return averageValue;
}
export function msToM_S_MS(ms) {
  // 1- Convert to seconds:
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60.0)
  seconds = seconds % 60
  let milisconds = ms % 1000
  let timeFormated = `${minutes}:${pad(seconds, 2)}:${milisconds}`
  return timeFormated;
}
export function msToM_S(ms) {
  // 1- Convert to seconds:
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60.0)
  seconds = seconds % 60
  let timeFormated = `${minutes}:${pad(seconds, 2)}`
  return timeFormated;
}
export function msToH_M_S(ms) {
  // 1- Convert to seconds:
  let seconds = ms / 1000;
  // 2- Extract hours:
  const hours = parseInt(seconds / 3600); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours
  // 3- Extract minutes:
  const minutes = parseInt(seconds / 60); // 60 seconds in 1 minute
  // 4- Keep only seconds not extracted to minutes:
  seconds = seconds % 60;
  return (hours + ":" + minutes + ":" + seconds);
}

export function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}