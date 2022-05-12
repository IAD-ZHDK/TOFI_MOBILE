
class TextBox {
    constructor (p, text, x,y,w,h, minW, maxW) {
        this.p = p
        this.text = text
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.size = 23
        minW = typeof minW !== 'undefined' ? minW : 0.6
        maxW = typeof maxW !== 'undefined' ? maxW : 0.9
        this.minW = minW
        this.maxW = maxW
    }
    display (x,y) {
        if (x){
            this.x = x
        }
        if (y){
            this.y = y
        }
        if (this.w < (this.minW*this.p.width)) {
            this.w = this.minW*this.p.width
        }
        if (this.w > (this.maxW*this.p.width)) {
            this.w = this.maxW*this.p.width
        }

        this.p.textAlign(this.p.CENTER)
        this.p.textSize(this.size)
        this.p.rectMode(this.p.CENTER)
        // this.p.fill(0,0,0,100);
        // this.p.rect(this.x, this.y, this.w+10, this.h)
        this.p.fill(255);
        this.p.noStroke();
        this.p.text(this.text, this.x, this.y, this.w, this.h); // Text wraps within
    }
    resize (x,y,w,h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }
    setText(text) {
        this.text = text
    }
    settextSize(size) {
        this.size = size
    }
}
export default TextBox
