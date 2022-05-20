import viewNames from './views/Views.js'
let ons = require('onsenui')
import { pad } from './views/viewUtils/MathUtils'

function statisticsMenu(data) {
    // populate statiticsMenu with Items
    const menu = document.querySelector('#statsList')
    menu.innerHTML = "";  // clear all existing stats
    let dateOptions = {year: '2-digit', month: 'numeric', day: 'numeric' };

    if (data !== null) {
            let date = ''
            let totalTimeTrianing = 0;
            let totalTrianings = 0;
            let averageDuration = 0;
            //menu.appendChild(document.createElement("hr"))
            let dateBlock = document.createElement("div");

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
                totalTimeTrianing += duration;
                totalTrianings++;
       
                if (newDate === date) {
              
                } else {
                    // new date 
                    console.log(newDate);
                    menu.appendChild(dateBlock)
                    dateBlock = document.createElement("div");
                    dateBlock.setAttribute("class", "dateBlock");
                    const menuItem = ons.createElement(`<h3 style="text-align: left;"">   ${newDate}</h3>`)
                    dateBlock.appendChild(menuItem)
                    date = newDate
                }
                if (metricName == "speedTest") {
                    const menuItem = ons.createElement(`<p style="text-align: center;""> SPEED TEST AVERAGE: ${metricValue} </p>`)
                    dateBlock.appendChild(menuItem)
                } else {
                    const menuItem = ons.createElement(`<ons-button modifier="large" style="margin-bottom: 10px;" onclick="EntryPoint.pushPage({'id':'graph.html', 'title':'graph', 'index':'${key}'})"> ${title}, duration: ${timeFormated}</ons-button>`)
                    dateBlock.appendChild(menuItem)
                }
            }
            // add last dateblock
            menu.appendChild(dateBlock)
            //const menuItem = ons.createElement(`<input type="button" id="dwn-btn" value="Download Statistics"/>`)
            //menu.appendChild(menuItem)
            //todo: scroll bar bug quick fix should be cleaned up here
            menu.appendChild(document.createElement("br"))
            menu.appendChild(document.createElement("br"))
            menu.appendChild(document.createElement("br"))
            menu.appendChild(document.createElement("br"))
            menu.appendChild(document.createElement("br"))
            /*document.getElementById("dwn-btn").addEventListener("click", function(){
                var text =  params.getLocalStorage()
                var filename = "statistics.txt";
                download(filename, text);
            }, false);
            */


            let minutes = Math.floor(totalTimeTrianing/60.0)
            let seconds = Math.floor(totalTimeTrianing%60)
             averageDuration = totalTimeTrianing/totalTrianings;
            let minutesAverage = Math.floor(averageDuration/60.0);
            let secondsAverage = Math.floor(averageDuration%60);
            
            const statsOverview = document.querySelector('#overview')
            statsOverview.innerHTML = "";  // clear all existing stats
             let overview = ons.createElement(`<p style="text-align: left;"">Training sessions completed:<br><b>`+totalTrianings+`</b></p>`)
             statsOverview.appendChild(overview);
             overview = ons.createElement(`<p style="text-align: left;"">Total time trained: <br>  <b>`+minutes+` Minutes `+seconds+` Seconds</b></p>`)
             statsOverview.appendChild(overview);
             overview = ons.createElement(`<p style="text-align: left;"">Average training duration:<br> <b>`+minutesAverage+` Minutes `+secondsAverage+` Seconds</b></p>`)
             statsOverview.appendChild(overview);
           // download("statistics.txt",params.getLocalStorage());
        
    } else {
        const menuItem = ons.createElement(`<p style="text-align: center;""> No statistics have been recorded yet.</p>`)
        menu.appendChild(menuItem)
    }

}


/*
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
*/
export default statisticsMenu