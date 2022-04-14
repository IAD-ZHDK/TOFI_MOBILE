import P5 from 'p5'
import View from './View'

class StatisticsOverview extends View {
    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        this.colorPallet = [196, 330, 36, 159, 312, 60, 250]
        this.p.colorMode(this.p.HSB)
        let keys = params.getSessionKeys()
        //loadLocal(index)
        this.dataEntries = [] //new object list with data sorted by date
        if (keys !== null) {
                for (let i = 0; i < keys.length; i++) {
                    let data = params.loadLocal(i)
                    let date = new Date(keys[i]).toDateString()
                    //check for repeats of dates
                    let repeats = false;
                    for (let j = 0; j < this.dataEntries.length; j++) {
                            if (this.dataEntries[j].date == date) {
                                this.dataEntries[j].duration += data.duration
                                this.dataEntries[j].data.push(data)
                                repeats = true
                                break
                            }
                    }
                    if (!repeats) {
                        // add new date container
                        const dateContainer = {'date': '0', 'duration': 1, 'data': []}
                        dateContainer.date = date
                        dateContainer.data.push(data)
                        dateContainer.duration += data.duration
                        this.dataEntries.push(dateContainer)
                        console.log(i);
                        console.log(data);
                    }
                }
        } else {
            //TODO: add message that there is no data recorded yet
        }
    }
    draw () {
        this.p.clear()
        let vh = this.p.height/100
        let vw = this.p.width/100
        this.p.translate(0,vh*10)
        this.p.textAlign(this.p.LEFT)
        this.p.text("A quick test of logging behaviour",vw*2,0)
        this.p.textAlign(this.p.LEFT)
        this.p.translate(0,vh*10);
        for (let i = 0; i < this.dataEntries.length; i++) {
            let date = this.dataEntries[i].date
            let textX = vw*5;
            let textY = i*vh*5;
            this.p.text(date,textX,textY)
           // let bbox = this.p.font.textBounds(date, textX,textY);
            let totalDuration = 0;
            for (let j = 0; j < this.dataEntries[i].data.length; j++) {
                let view = this.dataEntries[i].data[j].viewNumber
                let hue = this.colorPallet[view]
                let length = this.dataEntries[i].data[j].duration/1000
                this.p.push()
                this.p.fill(hue,255, 255)
                this.p.rect(vw*15+totalDuration,(i*vh*5),length,vh*2)
                this.p.pop()
                totalDuration += length+5
            }
        }
    }
}
export {StatisticsOverview}