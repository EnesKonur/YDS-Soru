const word = "ice";
fetch(https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&dt=bd&q=\)
  .then(res => res.json())
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
  });
