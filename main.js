const model = {

  mines: [],
  levels: [{width: 9,minesNum: 12},
           {width: 14,minesNum: 24},
           {width: 19,minesNum: 36},
           {width: 24,minesNum: 48},
           {width: 29,minesNum: 60},
         ],
  prepareMine: null,
  fields: [],
  isMine(fieldIdx) {
    return this.mines.includes(fieldIdx)
  },
  getMines(nowLevel){
    let arr = utility.getRandomNumberArray(nowLevel.width*nowLevel.width)
    this.mines = arr.slice(0,nowLevel.minesNum)
    this.prepareMine = arr[nowLevel.minesNum]
  },
  getFields(nowLevel){
    this.fields = Array.from({length: nowLevel.width*nowLevel.width},(field,index)=>({
      number: index,
      isDigged: false,
      isFlag: false
    }))
  },
  getRemainMineNum(){
    return this.mines.length - this.fields.filter(f=>f.isFlag).length
  },
}
const view = {
  displayFields(nowLevel) {
    let html_content = ''
    for(let i=0;i<nowLevel.width;i++){
      html_content+=`<div class="roww">`
      for(let j=0;j<nowLevel.width;j++){
        html_content+=`<div class="shadow field back" data-tag="${i*nowLevel.width+j}"></div>`
      }
      html_content+=`</div>`
    }
    document.getElementById('game').innerHTML = html_content
  },
  showFieldContent(field) {
    let fieldNode = document.querySelector(`.field[data-tag="${field.number}"]`)
    // 正常翻開
    fieldNode.classList.remove('back')
      switch(field.type){
      case 'ocean': 
        fieldNode.innerHTML = ``
        fieldNode.classList.add('ocean')
        break
      case 'mine':
        fieldNode.innerHTML = `<i class="fas fa-bomb"></i>`
        break
      default:
        fieldNode.innerHTML = field.type
        fieldNode.style.color = utility.mapColor[field.type]
        fieldNode.classList.add('integer')
        break
    }
  },
  showWrong(field){
    let fieldNode = document.querySelector(`.field[data-tag="${field.number}"]`)
    console.log(fieldNode)
    fieldNode.innerHTML += `<i class="fas fa-times"></i>`
    
  },
  renderInfo(number,idName){
    let numArr = number.toString().split('').reverse()
     let numNodes = Array.from(document.getElementById(idName).querySelectorAll('.number')).reverse()
     numNodes.forEach((node,i)=>this.renderNum(numNodes[i],utility.mapNum[numArr[i] || 0]))
  },
  renderMessage(mes){
    document.getElementById('message').innerText = mes
  },
  renderNum(numNode,numStructionArr){
    let boxes = ['top','bottom']
    let direction = ['Top','Right','Bottom','Left']
    boxes.forEach(box=>{
      direction.forEach((dir,index)=>{
        numNode.querySelector(`.${box}`).style[`border${dir}Color`] = numStructionArr[box==='top'?index:index+4] === 1 ? '#f24' : 'rgba(82,0,0,1)'
      })
    })
  },
  toggleFlag(field,remainFlagsNum){
    // 如果旗子被放完了就不打開也不執行接著的動作
  if(!field.isFlag && remainFlagsNum===0) return
    
  if(!field.isDigged){
    field.isFlag = !field.isFlag
    let fieldNode = document.querySelector(`.field[data-tag="${field.number}"]`)
    fieldNode.innerHTML = field.isFlag ? `<i class="fas fa-flag"></i>`: ''
  }
},
  showBomb(field){
    document.querySelector(`.field[data-tag="${field.number}"]`).classList.add('bomb')
  },
  updateStatus(emotion){
    document.getElementById('statusIcon').className = `fas fa-${emotion}`
  },
  challengeMode(nowLevelIndex,levels){
    challengePart.style.display = 'block'
    newGamePart.style.display = 'none'
    startNewGameBtn.style.display = 'none'
    view.renderMessage(`開始挑戰第${nowLevelIndex+1}關/共${levels}關`)
  },
  customMode(nowLevel){
    challengePart.style.display = 'none'
    newGamePart.style.display = 'block'
    startNewGameBtn.style.display = 'block'
    view.renderMessage(`客製化挑戰${nowLevel.width}x${nowLevel.width}:${nowLevel.minesNum}個炸彈 `)
     
  }
  
}
const controller = {
  isStart: false,
  mode: '',
  tries:0,
  time: 0,
  timer: null,
  nowLevel: model.levels[0],
  nowLevelIndex: 0,
  createGame() {
    view.displayFields(this.nowLevel)
    this.setMinesAndFields() 
    // addlistener
    this.addClickAndRightclick()
    // model.fields.forEach(field=>view.showFieldContent(field))
    this.initView()
  },
  init(){
    console.log('init')
    this.time = 0
    this.tries = 0
    this.isStart = false
    // this.createGame()
    
  },
  initView(){
    view.renderInfo(this.time,'timer') 
    view.renderInfo(model.getRemainMineNum(),'mineNum')
    view.updateStatus('smile')
  },
  challengeWin(){
    console.log('winnnnnnnn!')
    this.gameWin()
    this.nowLevelIndex++
    if(this.nowLevelIndex===model.levels.length){
      view.renderMessage('太厲害了吧　闖五關成功')
    }else{
      view.renderMessage(`第${this.nowLevelIndex}關成功　繼續闖關`)
      setTimeout(()=>{
        this.setChallengeMode()
      },1000)
    }
  },
  customWin(){
    view.renderMessage(`客製化闖關成功`)
  },
  addClickAndRightclick(){
    // 右鍵建立旗子
    document.querySelectorAll('.field').forEach(field=>{
        field.addEventListener('contextmenu', evt => {
          evt.preventDefault()
          if(!this.isStart && this.tries!==0) return
          if(this.mode==='') return 
          // 傳一個不再陣列的數
          this.isFirstTrigger(-1)
          this.tries++
          let fieldTarget = model.fields.find(f=>f.number ===parseInt(field.dataset.tag))
          view.toggleFlag(fieldTarget,model.getRemainMineNum())
          view.renderInfo(model.getRemainMineNum(),'mineNum')
          // 判斷建立完旗子有沒有結束
          if(this.mode==='challenge'){
            if(this.isGamewin()){
              this.challengeWin()
            }
          }else{
            if(this.isGamewin()){
              this.customWin()
            }
            
          }
          
        })
      })
    // 左鍵打開
    document.getElementById('game').addEventListener('click',evt=>{
      // 防止遊戲結束了還繼續按
      if(!this.isStart && this.tries!==0) return
      if(this.mode==='') return 
      if(evt.target.matches('.field')){
        let num = parseInt(evt.target.dataset.tag)
        this.isFirstTrigger(num)
        this.tries++
        let fieldTarget = model.fields.find(field=>field.number ===num)
        this.dig(fieldTarget)
      }
    })
  },
  isFirstTrigger(num){
    if(!this.isStart && this.tries==0){
      console.log('isfirst')
      this.isStart = true
      this.setTimer()
      // 確保第一個不是炸彈
      if(this.isFirstMine(num)){
        console.log('is bumb! new bomb')
        this.changeMine(num)
      }
      
    }
    
  },
  changeMine(num){
    let targetIndex = model.mines.findIndex(mine=>mine===num)
    model.mines[targetIndex]=model.prepareMine
    // 重新產生內容
    this.getAllFieldsData()
    console.log(model.prepareMine)
    console.log( model.mines[targetIndex])
  },
  isFirstMine(num){
    return  model.mines.findIndex(mine=>mine===num)!=-1
  },
  setTimer(){
    this.timer = setInterval(()=>{
      if(this.isStart){
        view.renderInfo(this.time,'timer')
        this.time++
      }else{
        clearTimeout(this.timer)
      }
    },1000)
  },
  setMinesAndFields() {
    model.getMines(this.nowLevel)
    model.getFields(this.nowLevel)
    this.getAllFieldsData()
  },
  
  gameWin(){
    let unDiggedArr = model.fields.filter(field=>!field.isFlag && !field.isDigged)
    unDiggedArr.forEach(f=>this.dig(f))
  },

  getExistField(row,col){
    let arr = []
    
    for(let r=row-1;r<=row+1;r++){
      for(let c=col-1;c<=col+1;c++){
        // 不要算到自己
        if(r!=row || c!=col){
           if(this.checkField(r,c)){
            arr.push(r*this.nowLevel.width+c)
          }
        }
      }
    }
    return arr
  },
  
  checkField(row,col){
    let rowRange = row>=0 && row<this.nowLevel.width
    let colRange = col>=0 && col<this.nowLevel.width
    return rowRange && colRange
  },
  
  getFieldData(fieldIdx) {
    // 求出周遭的編號是不是炸彈
    let row = parseInt(fieldIdx/this.nowLevel.width)
    let col = fieldIdx%this.nowLevel.width
   
    let nearNums = this.getExistField(row,col)
    let content = ''
    let mineCount = 0
    // isMine
    if(model.isMine(fieldIdx)){
      content = 'mine'
    }else{
      nearNums.forEach(num=>{
        if(model.mines.findIndex(n=>n===num)!=-1){
          mineCount++
        }
        content = mineCount===0? 'ocean' :mineCount
      })
    }
    return { content: content,nearNums: nearNums}
  },
  getAllFieldsData(){
    model.fields.forEach(field=>{
      field.type = this.getFieldData(field.number).content
    })
  },
  dig(field) {
    field.isDigged = true
    switch(field.type){
      case 'mine': 
        this.gameover(field)
        return
      case 'ocean': 
        this.spreadOcean(field)
      default: 
        view.showFieldContent(field)
        view.updateStatus('surprise')
        setTimeout(()=>{
          view.updateStatus('smile')
        },200)
    }
    
    
    
  },
  gameover(field){
    view.renderMessage('哈哈哈踩到地雷 可以去簽樂透囉')
    view.showBomb(field)
    view.updateStatus('dizzy')
    this.isStart = false
    // 篩選有地雷或是有旗子的
    model.fields.filter(field=>field.type=='mine' || field.isFlag)
      .forEach(f=>{
      // 猜錯了
      if(f.type!=='mine'){
        // 不是地雷 但是有旗子
        // f.isDigged = true
        // view.showFieldContent(f)
        view.showWrong(f)
      }else if(!f.isFlag){
        // 是地雷但是沒有旗子
        f.isDigged = true
        view.showFieldContent(f)
      }else {
        // 猜對了
         console.log('good you find it')
      }
    })
    
    
  },
  isGamewin(){
    let flagNum = model.fields.filter(f=>f.isFlag).length
    
    if(flagNum===model.mines.length){
     let result =  model.fields.filter(f=>f.isFlag).every(flied=>model.mines.find(m=>m===flied.number))
     console.log(result)
    return result
    }else{
      console.log(`bumb amount is not 12`)
      console.log(flagNum,model.mines.length)
      return false
    }
  },
  spreadOcean(field) {
    // 旁邊是海洋還沒被挖開的也還沒被放旗子的
    let nearOceansFields = this.getFieldData(field.number).nearNums
    .filter(n=>model.fields.find(f=>f.number ===n).isDigged===false && model.fields.find(f=>f.number ===n).isFlag===false)
    .filter(n=>this.getFieldData(n).content!=='mine')
    .map(n=>model.fields.find(f=>f.number ===n))
    // 打開這些
    // 保留海洋繼續
    nearOceansFields.forEach(field=>this.dig(field))
  },
   customGame(gWidth,bombNum){
     this.nowLevel = {width: gWidth,minesNum:bombNum}
     this.init()
     $('#myModal').modal('hide')
     this.mode = 'custom'
     view.renderMessage(`客製化挑戰${gWidth}x${gWidth}:${bombNum}個炸彈 `)
     this.createGame()
  },
  setChallengeMode(){
    this.mode = 'challenge'
    this.init()
    this.nowLevel = model.levels[this.nowLevelIndex]
    this.createGame()
    view.challengeMode(this.nowLevelIndex,model.levels.length)
    
  },
  checkCustom(gWidth,bombNum){
    if(gWidth<10&&gWidth>100){
      alert('設定遊戲寬度在10~100之間')
      return false
    }
    if(bombNum<gWidth*2){
      alert('炸彈數量太少 設定數量為格子數的兩倍以上')
      return false
    }else if(bombNum>gWidth*gWidth/2){
      alert('炸彈數量不可以超過格子總數的一辦喔')
      return false
    }
    return true
  },
  renderModeMes(){
    if(this.mode ==='challenge'){
      view.challengeMode(this.nowLevelIndex,model.levels.length)
    }else if(this.mode==='custom'){
       view.customMode(this.nowLevel)
    }
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = [...Array(count).keys()]
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
      ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }

    return number
  },
  mapNum: {
    // top :上右下左 bottom:上右下左
    1: [0,1,0,0,0,1,0,0],
    2: [1,1,1,0,1,0,1,1],
    3: [1,1,1,0,1,1,1,0],
    4: [0,1,1,1,1,1,0,0],
    5: [1,0,1,1,1,1,1,0],
    6: [1,0,1,1,1,1,1,1],
    7: [1,1,0,0,0,1,0,0],
    8: [1,1,1,1,1,1,1,1],
    9:[1,1,1,1,1,1,1,0],
    0: [1,1,0,1,0,1,1,1]
  },
  mapColor: {
    1: 'blue',
    2: 'green',
    3: 'red',
    4: 'purple',
    5: 'orange',
    6: 'yellow',
    7: 'brown',
    8: '#000'
  }
  
}

const challengePart = document.getElementById('challenge')
const newGamePart = document.getElementById('newGame')
const startNewGameBtn = document.getElementById('startNewGame')
// controller.createGame(9, 12)
controller.init()
controller.createGame()

// 放在裡面會重複呼叫QQQ???
document.getElementById('statusIcon').addEventListener('click',evt=>{
  if(controller.mode==='') return 
  controller.init()
  controller.createGame()
  console.log('restart')
  controller.renderModeMes()
})

startNewGameBtn.addEventListener('click',evt=>{
  let gWidth = parseInt(document.getElementById('gameWidth').value)
  let bombNum = parseInt(document.getElementById('bombNum').value)
  if(controller.checkCustom(gWidth,bombNum)){
    controller.customGame(gWidth,bombNum)
  }
})

document.querySelector('#info').addEventListener('click',evt=>{
  if(evt.target.tagName ==='BUTTON'){
    if(evt.target.id==='challengeBtn'){
      controller.setChallengeMode()
    }else{
      // customBtn
      view.customMode(controller.nowLevel)
    }
  }
})