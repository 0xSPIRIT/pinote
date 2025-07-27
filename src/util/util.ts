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

export async function readFileFromServer(filepath: string) {
  const getRequest = "http://localhost:3000/api/note?query=" + filepath;

  try {
    const res = await fetch(getRequest);
    const data = await res.json();

    return data.result;
  } catch (err) {
    console.error("Error fetching file: ", err);
    return "INVALID";
  }
}

export async function saveFileToServer(filepath: string, data: string) {
  try {
    const response = await fetch("http://localhost:3000/api/note",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filepath: filepath,
        data: data
      })
    });

    if (!response.ok) {
      console.error("fetch() error: ", await response.text());
    }
  } catch (err) {
    console.error("Error saving file: ", err);
  }
}
