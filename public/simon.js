/* global Vue */
/* global axios */

var afterPlaySeq = function(){
    game.startUserTurn()
}


var game = new Vue ({
    el: '#game',
    
    data: {
        gameName: "Screen Slaver",
        GAME_STATES: ["loading","login","menu","playing","lost","scores"],
        gameState: "loading",
        playerTurn: false,
        username: '',
        nameQuery: '',
        currentScore: 0,
        userScores: [],
        highScores: [],
        maxScores: 25,
        simonMessage: "",
        simonSeq: [],
        simonSeqIdx: 0,
        ctDwn: 3,
        userAttempt: [],
        round: 0,
        playingColors: [],
        simonColor: null,
        showSimonColor: false,
        numColors: 6,
        simonSpeed: 1000,
        uiColors: {play: null, scores: null, submit: null, back: null},
        allColors: ["dodgerblue","lime","blueviolet","gold","red","darkorange","magenta", "aqua"],
        screenBgURL: "images/static_fizzle.gif",
        bgURLS: {
            'static': "images/static_fizzle.gif",
            'error': "images/static_colors.gif",
            'hypno': "images/hypno.gif",
        },
        
    },
    
    async created() {
        this.gameState = this.GAME_STATES[0]
        this.uiColors.play = this.randomFrom(this.allColors)
        this.uiColors.scores = this.randomFrom(this.allColors)
        this.uiColors.submit = this.randomFrom(this.allColors)
        this.uiColors.back = this.randomFrom(this.allColors)
        
        let colorsLeft = Array.from(this.allColors)
        for (let i = 0; i < this.numColors; i++) {
            let idx = this.randomIdxOf(colorsLeft)
            this.playingColors.push(this.allColors.indexOf(colorsLeft[idx]))
            colorsLeft.splice(idx,1)
        }
        
        this.gameState = this.GAME_STATES[2]
    },
    
    watch: {
        gameState() {
            // LOADING
            if (this.gameState === this.GAME_STATES[0]){
                this.simonMessage = "";
                this.screenBgURL = this.bgURLS.error;
            }
            // LOGIN
            if (this.gameState === this.GAME_STATES[1]){
                this.simonMessage = "Welcome";
                this.screenBgURL = this.bgURLS.static;
            }
            // MAIN
            if (this.gameState === this.GAME_STATES[2]){
                this.simonMessage = this.gameName;
                this.screenBgURL = this.bgURLS.hypno;
            }
            // PLAYING
            if (this.gameState === this.GAME_STATES[3]){
                this.screenBgURL = this.bgURLS.static;
            }
            // GAME OVER
            if (this.gameState === this.GAME_STATES[4]){
                this.simonMessage = "Game Over";
                this.screenBgURL = this.bgURLS.error;
                
            }
            // SCORES
            if (this.gameState === this.GAME_STATES[5]){
                this.simonMessage = "High Scores";
                this.screenBgURL = this.bgURLS.static;
            }
        }
    },
    
    methods: {
        randomIdxOf(array){
            return Math.round(Math.random()*(array.length-1))
        },
        
        randomFrom(array){
            return array[Math.round(Math.random()*(array.length-1))]
        },
        
        abortToMenu() {
            this.gameState = this.GAME_STATES[2]
        },
        
        startGame(){
            this.currentScore
            this.gameState = this.GAME_STATES[3]
            this.playerTurn = false;
            this.simonSeq = []
            this.round = 0;
            
            this.startNewRound()
        },
        
        startNewRound(){
            this.round++
            this.screenBgURL = this.bgURLS.hypno;
            this.showSimonColor = false;
            this.simonMessage = "Round " + this.round;
            setTimeout( game.doSimonTurn, 1000 )
        },
        
        doSimonTurn(){
            this.playerTurn = false;
            this.simonSeq.push(this.randomFrom(this.playingColors))
            this.playSimonSeq( this.startUserTurn )
        },
        
        playSimonSeq(done) {
            let playing = this.gameState === "playing";
            if (playing && game.ctDwn > 0){
                console.log(this.ctDwn, this.simonMessage)

                    
                this.screenBgURL = this.bgURLS.static;
                game.showSimonColor = false;

                game.simonMessage = game.ctDwn

                game.ctDwn--
                setTimeout( game.playSimonSeq, game.simonSpeed )
            }
            
            else if (playing) {
                game.simonMessage = ""
                
                if(game.simonSeqIdx >= game.simonSeq.length){
                    game.ctDwn = 3;
                    game.simonSeqIdx = 0;
                    afterPlaySeq()
                    return
                }
                game.swapSimonColor(game.allColors[game.simonSeq[game.simonSeqIdx]])
                game.simonSeqIdx++
                setTimeout( game.playSimonSeq, game.simonSpeed )
            }
            
        },
        
        swapSimonColor(colorString){
            if(this.gameState === "playing"){
                this.simonColor = "#000"
                game.showSimonColor = true;
                setTimeout( function(){ game.simonColor = colorString }, 50 )
            }
        },
        
        startUserTurn(){
            this.showSimonColor = false;
            this.playerTurn = true;
            this.userAttempt = [];
        },
        
        onUserAttempt(colorIdx){
            
            this.swapSimonColor(this.allColors[colorIdx])
            console.log(this.allColors[colorIdx])
            
            let atmptIdx = this.userAttempt.length;
            this.userAttempt.push(colorIdx)
            console.log(this.simonSeq, this.userAttempt)
            console.log(this.round, this.simonSeq.length)
            
            let isMatch = (this.userAttempt[atmptIdx] === this.simonSeq[atmptIdx]);
            
            if (isMatch) {
                console.log('good job!')
                
                if (atmptIdx === this.simonSeq.length - 1) {
                    this.onWin()
                }
            }
            else {
                this.onLose()
            }
        },
        
        onWin(){
            console.log('round complete')
            this.playerTurn = false;
            
            let scoreAddDuration = 100;
            let totalDuration = 0;
            
            //play animation!
            totalDuration += 1000;
            
            
            //AWARDING POINTS        
            
            function addToScore(points){
                let toAdd = Math.round(points)
                
                for(let pt = 1; pt < toAdd; pt++){
                    setTimeout(
                        function(){
                            game.currentScore++
                            totalDuration++
                            game.simonMessage = `Score: ${game.currentScore}`;
                        }, 1
                    )
                }
            };
            
            let funcs = [
                function() { return 100; },
                function() { return 10 * game.numColors; },
                function() { return Math.round(10000 * (1 / game.simonSpeed)) },
            ]
            
            setTimeout( function(){
                
                for(let i = 0; i < funcs.length; i++){
                    addToScore( funcs[i]() );
                }
                    
            }, totalDuration)
            
            
            setTimeout( game.startNewRound, totalDuration + 1000);
        },
        
        awardPoints(){
        },
        
        onLose(){
            console.log('GAME OVER!')
            this.playerTurn = false;
            this.gameState = this.GAME_STATES[4]
        },
        
        async sendScore() {
            this.username = this.nameQuery;
            console.log('sending score')
            await axios.post('/scores', {
                username: game.username,
                score: game.currentScore
            })
            game.openScores()
        },
        
        openScores(){
            this.gameState = this.GAME_STATES[5];
            this.getHighScores()
        },
        
        async getHighScores() {
            this.screenBgURL = this.bgURLS.error;
            let res = await axios.get('/scores?max=' + this.maxScores)
            this.highScores = res.data;
            console.log(this.highScores)
            await this.getUserScores()
            this.screenBgURL = this.bgURLS.static;
        },
        
        async getUserScores(){
            this.username = this.nameQuery;
            let res = await axios.get('/scores/' + this.username)
            this.userScores = res.data;
            console.log(this.userScores)
        },
        
        logout() {
            this.username = "";
            this.userScores = 0;
        },
    },
    
    computed: {
        nameIsGood() {
            return this.nameQuery.length > 0
        }
    }
})