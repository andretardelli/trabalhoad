
function geradorAleatorio( seed ){
    
    const m = Math.pow(2,31) - 1;
    const b = Math.pow(7,5);
    const c = 0;
    this.z_atual;

    
    //========================================================================
    this.setSeed = function( s ){
        s = 1 + s%(m-1)    //Precisamos garantir que s != 0 para evitar z_atual == 0
        this.z_atual = s % m;
    }
    this.step = function(){
        this.z_atual = ( this.z_atual * b + c ) % m;
    }
    // Retorna flutuante entre 0 e 1
    this.rand = function(){
        this.step();
        return this.z_atual / m;
    }
    // Retorna inteiro entre 1 e m-1
    this.randi = function(){
        this.step();
        return this.z_atual;
    }
    // Retorna numero exponencialmente distribuido com taxa lambda
    this.exponential = function( lambda ){
        this.step();
        var u = this.z_atual / m;
        return Math.log( 1 - u ) / ( - lambda );
    }
    //========================================================================

    //Se não foi passada nenhuma seed, usa Date.getTime(), que é a contagem em milisegundos desde (Jan 1, 1970) :
    if( isNaN(parseInt(seed,10)) ){
        var date = new Date();
        seed = ( date.getTime() * Math.pow(7,5) ) % m ;
    }
    
    this.setSeed( parseInt(seed,10) );

}