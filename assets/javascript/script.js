interact('.draggable').draggable({
  inertia: true,
  // restrict: {
  //   restriction: "parent",
  //   endOnly: true,
  //   elementRect: { top: 0, left: 4, bottom: 1, right: 1 }
  // },
  onmove: function (event) {
    let target = event.target;   
    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.webkitTransform =
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  },
  onend: function(event) {
      console.log(event);
  }
}).on('move', function (event) {
      let interaction = event.interaction;
      if (interaction.pointerIsDown && !interaction.interacting() && event.currentTarget.getAttribute('clonable') != 'false') {
      let dropZone = document.querySelector("#outer-dropzone");
      let original = event.currentTarget;
      let clone = event.currentTarget.cloneNode(true);
      let x = clone.offsetLeft;
      let y = clone.offsetTop;
      clone.setAttribute('clonable','false');
      clone.style.position = "absolute";
      clone.style.left = original.offsetLeft+"px";
      clone.style.top = original.offsetTop+"px";  
      original.parentElement.appendChild(clone);
      dropZone.appendChild(clone);
      interaction.start({ name: 'drag' },event.interactable,clone);
}});

// // html2canvas eventlistener on save button
// let captureZone = document.querySelector("#outer-dropzone");
// document.getElementById("save").addEventListener("click", function(event){
//   event.preventDefault();
//   html2canvas(captureZone).then(function(canvas) {
//       document.body.appendChild(canvas); 
//   });
// });


