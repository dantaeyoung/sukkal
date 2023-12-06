Openai = {};

/*
fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    audio: audioData,
    model: 'your_selected_model', // Specify the model you want to use
  }),
})
.then(response => response.json())
.then(data => {
  // Handle the transcribed text data returned by the API
  console.log('Transcribed Text:', data.transcription);
})
.catch(error => {
  console.error('API Request Error:', error);
});*/

Openai.fetchtest = function() {
    console.log("Calling GPT3")
    var url = "https://api.openai.com/v1/chat/completions";
    var bearer = 'Bearer ' + api_key;
    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': bearer,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [
              {
                "role": "system",
                "content": "You are a helpful assistant."
              },
              {
                "role": "user",
                "content": "Hello!"
              }
            ]
        })


    }).then(response => {

        return response.json()

    }).then(data=>{
        console.log(data)
        console.log(typeof data)
        console.log(Object.keys(data))
        console.log(data['choices'][0].text)

    })
        .catch(error => {
            console.log('Something bad happened ' + error)
        });

}

Openai.transcribe = function(blob, cb) {
    const api_key = Helpers.getApiKey();
    if(api_key == "") { return; }
    console.log("Trying to transcribe")
    var url = "https://api.openai.com/v1/audio/transcriptions";
    var bearer = 'Bearer ' + api_key;

    // Create a new FormData object
    const formData = new FormData();
    //formData.append('file', blob, { type: 'audio/wav' }); // Change the type if needed
    formData.append('file', blob); // Change the type if needed
    formData.append('model', 'whisper-1'); // Specify the desired model


    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': bearer,
        },
        body: formData,
    })
    .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
        console.log(response)
    }
    return response.json();
  })
  .then(data => {
    // Handle the response data as needed
    console.log('Transcription response:', data);
    cb(data['text']);
  })
  .catch(error => {
    console.error('Error:', error);
    // Handle errors appropriately
  });

}

