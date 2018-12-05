function Fila()
//crio um objeto que guarda uma fila de objetos no sistema
{
    //crio um array que representa minha fila
    this.array = [];

    //insiro o meu elemento na fila e calculo o seu tempo de chegada
    this.push = function(newElement)
    {
        this.array.push(newElement);
        this.array.sort(function(a, b){return a.eventStartTime- b.eventStartTime});
    };

    //removo o meu elemento da fila, e determino que ele foi servido
    this.pop = function()
    {
        //removo um elemento no inicio do array, e o retorna no final
        var served = this.array[0];
        this.array.splice(0,1);
        return served;
    };

    //minha fila está vazia
    this.emptyQueue = function()
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