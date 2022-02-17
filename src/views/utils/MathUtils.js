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
        averageValue += Math.floor(newValue* (1.0 - filter))
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