import TextBox from "./TextBox";

export function addBtn(callback, label) {
    const containerElement = document.getElementById('p5-container')
    let div = document.createElement("div");
    div.style.cssText = 'position:absolute; top:90%; left:50%; transform:translate(-50%, -50%);'
    let btn = document.createElement("ons-button")
    btn.innerHTML = label
    btn.onclick = function () {
        containerElement.removeChild(div)
        callback()
    }.bind(this);
    div.appendChild(btn);
    containerElement.appendChild(div)
}
