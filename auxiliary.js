
//Objeto que guarda uma fila de objetos no sistema
function Fila()
{
    
    this.array = [];            // Array que representa todos elementos dentro da fila (incluindo em serviço)
    this.disciplina = "FCFS";   // "FCFS" ou "LCFS"

    //Insere um elemento na fila, levando em conta a disciplina
    this.push = function(newElement)
    {
        //Caso 'First come first service'
        if( this.disciplina == "FCFS" ){
            
            //Simplesmente vai pro final da fila
            this.array.push( newElement );

            //Acho que não tem problema não usar sort toda hora que insere
            //this.array.sort(function(a, b){return a.eventStartTime- b.eventStartTime});
        }
        else
        //Caso 'Last come first service'
        if( this.disciplina == "LCFS" ){
            
            //Caso fila vazia, entra na posição 0
            if( this.array.length == 0 ){
                this.array.push( newElement );
            }
            //Caso contrário, sempre entra na posição 1 (imediatamente antes do elemento em serviço)
            else{
                this.array.splice(1,0,newElement);
            }
            
            //Acho que não tem problema não usar sort toda hora que insere
            //No caso de LCFS, usar sort sempre é um problema (pode interromper o serviço atual)
            //this.array.sort(function(a, b){return a.eventStartTime- b.eventStartTime});
        }
    };

    //Remove um elemento da fila e o retorna.
    this.pop = function()
    {
        var served = this.array[0];
        this.array.splice(0,1);
        return served;
    };

    //Retorna se a fila está vazia
    this.vazia = function()
    {
        return (this.array.length === 0);
    }
}

function atribuiEvento(_type, _eventStartTime)
{
    //crio um evento
    var arrival = {type:"", eventStartTime:0};
    //verifico se o evento é um evento de chegada ou de partida, e o instante que ocorreu
    arrival.type = _type;
    arrival.eventStartTime = _eventStartTime;

    return arrival;
}
