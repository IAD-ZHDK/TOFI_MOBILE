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
        }
    } else {
        //TODO: add message that there is no data recorded yet
    }
}

export default statisticsMenu