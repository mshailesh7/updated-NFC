// This code goes in the renderer.js or a script tag in location.html
document.getElementById('startTaggingButton').addEventListener('click', () => {
    const location = document.getElementById('location-name').value;
    const date = document.querySelector('[type=date]').value;
    const time = document.querySelector('[type=time]').value;

    localStorage.setItem('locationData', JSON.stringify({ location, date, time }));

    //console.log("Saved locationData:", location);
});
