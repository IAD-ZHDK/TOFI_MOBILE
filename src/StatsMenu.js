import viewNames from './views/Views.js'
let ons = require('onsenui')

function statisticsMenu(data) {
    //console.log("stats_:"+stats.length)
    // populate statiticsMenu with Items
    const menu = document.querySelector('#statsList')
    menu.innerHTML = "";  // clear all existing stats
    let dateOptions = {year: '2-digit', month: 'numeric', day: 'numeric' };
    if (data !== null) {
        //let sliceIndex = data.length - menu.childElementCount
            // add missing menu items
            let date = ''
            //for (let i = 0; i < data.length; i++) {
            for (const [key, entry] of Object.entries(data)) {
                const dateObject = new Date(entry.start)
                let newDate = dateObject.toLocaleDateString("en-GB", dateOptions)
                let viewNumber = entry.metric
                let title = `${viewNames[entry.viewNumber]}`
                let metricName = viewNumber
                let metricValue = entry.metricValue
                let duration = Math.floor(entry.duration/1000.0) // convert to seconds 
                let minutes = Math.floor(duration/60.0)
                let seconds = duration%60
                let timeFormated =  `${minutes}:${pad(seconds,2)}`
                if (newDate === date) {

                } else {
                    const hr = ons.createElement(`<hr>`)
                    menu.appendChild(hr)
                    const menuItem = ons.createElement(`<p style="text-align: left;""> ${newDate}</p>`)
                    menu.appendChild(menuItem)
                    date = newDate
                }
                if (metricName == "speedTest") {
                    const menuItem = ons.createElement(`<p style="text-align: center;""> SPEED TEST: ${metricValue} </p>`)
                    menu.appendChild(menuItem)
                } else {
                    const menuItem = ons.createElement(`<ons-button modifier="large" style="margin-bottom: 10px;" onclick="EntryPoint.pushPage({'id':'graph.html', 'title':'graph', 'index':'${key}'})"> ${title}, duration: ${timeFormated}</ons-button>`)
                    menu.appendChild(menuItem)
                }
            }
            const menuItem = ons.createElement(`<input type="button" id="dwn-btn" value="Download Statistics"/>`)
            menu.appendChild(menuItem)
            //todo: scroll bar bug quick fix should be cleaned up here
            menu.appendChild(document.createElement("br"))
            menu.appendChild(document.createElement("br"))
            menu.appendChild(document.createElement("br"))
            menu.appendChild(document.createElement("br"))
            menu.appendChild(document.createElement("br"))
            document.getElementById("dwn-btn").addEventListener("click", function(){
                var text =  params.getLocalStorage()
                var filename = "statistics.txt";
                download(filename, text);
            }, false);
           
           // download("statistics.txt",params.getLocalStorage());
        
    } else {
        const menuItem = ons.createElement(`<p style="text-align: center;""> No statistics have been recorded yet.</p>`)
        menu.appendChild(menuItem)
    }
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}



function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

export default statisticsMenu