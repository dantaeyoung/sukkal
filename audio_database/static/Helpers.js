Helpers = {}



Helpers.strToPastelHsl = function(inputChar) {
  // Generate a hash value from the input character
  const hash = inputChar.repeat(5).split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Calculate HSL components based on the hash value
  const hue = (hash % 360 + 360) % 360; // Ensure hue is in the range [0, 360]
  const saturation = (hash % 50 + 50) + '%'; // Dynamic saturation in the range [50%, 99%]
  const lightness = '80%'; // Fixed lightness

  // Return the HSL color in 'hsl(hue, saturation, lightness)' format
  return `hsl(${hue}, ${saturation}, ${lightness})`;
}

Helpers.apikeyLocalStorage = function() {
  // Retrieve input field element
  const inputField = document.getElementById('openai_api_key');

  // Check if a value is stored in Local Storage and set it as the input value
  const savedValue = localStorage.getItem('openai_api_key');
  if (savedValue) {
    inputField.value = savedValue;
  }

  // Save input value to Local Storage whenever it changes
  inputField.addEventListener('input', function () {
    localStorage.setItem('openai_api_key', inputField.value);
  });

}

Helpers.getApiKey = function() {
  const inputField = document.getElementById('openai_api_key');
  // Check if a value is stored in Local Storage and set it as the input value
  const savedValue = localStorage.getItem('openai_api_key');
  if (savedValue) {
    inputField.value = savedValue;
  }
  return inputField.value;
 }



Helpers.format12HourTime = function(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const amOrPm = hours >= 12 ? 'pm' : 'am';

  // Convert hours to 12-hour format
  const formattedHours = hours % 12 || 12;

  // Ensure single-digit minutes and seconds are padded with leading zeros
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${amOrPm}`;
}





Helpers.apikeyLocalStorage();

