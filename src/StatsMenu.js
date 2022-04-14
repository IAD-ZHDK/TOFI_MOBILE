import viewNames from './views/Views.js'

function statisticsMenu(ons, params) {
    // populate statiticsMenu with Items
    const menu = document.querySelector('#statsList')
    let data = params.getSessionKeys()
    let dateOptions = {year: '2-digit', month: 'numeric', day: 'numeric' };
    if (data !== null) {
        let sliceIndex = data.length - menu.childElementCount
        if (sliceIndex > 0) {
            // add missing menu items
            let date = ''
            for (let i = data.length - sliceIndex; i < data.length; i++) {
                const dateObject = new Date(data[i])
               // let title = dateObject.toLocaleString() //2019-12-9 10:30:15
                let newDate = dateObject.toLocaleDateString("en-GB", dateOptions)
                let time = dateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                let viewNumber = params.loadLocal(i).metric
                let title = `${viewNames[params.loadLocal(i).viewNumber]}`
                let metricName = params.loadLocal(i).metric
                let metricValue = params.loadLocal(i).metricValue
                let duration = params.loadLocal(i).duration/1000 // convert to seconds 
                let minutes = Math.floor(duration/60)
                let seconds = ('0'+duration%60).slice(-2)
                let timeFormated =  `${minutes}:${seconds}`
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
                    const menuItem = ons.createElement(`<ons-button modifier="large" style="margin-bottom: 10px;" onclick="EntryPoint.pushPage({'id':'graph.html', 'title':'graph', 'index':'${i}'})"> ${title}, duration: ${timeFormated}</ons-button>`)
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
        }
    } else {
        const menuItem = ons.createElement(`<p style="text-align: center;""> No statistics have been recorded yet.</p>`)
        menu.appendChild(menuItem)
    }
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