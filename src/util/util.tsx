export function capFirstLetter(str: string) {
  if (str.length == 0)
    return "";

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getDateTime() {
  const now = new Date();
  const localizedDate = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const timeOptions = { 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true 
  };
  const timeString = now.toLocaleString('en-US', timeOptions); 

  return localizedDate + " " + timeString;
}

export function substringElements(str: string, substr: string): number {
  let maxCount = 0;

  for (let i = 0; i < str.length; i++) {
    let count = 0;

    for (let j = 0; j < substr.length; j++) {
      const k = i + j;

      if (k >= str.length)  break;
      if (str[k] != substr[j]) break;

      count++;
    }

    if (count > maxCount)
      maxCount = count;
  }

  return maxCount;
}
