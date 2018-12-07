
//Objeto que guarda uma fila de objetos no sistema
function Fila( _disciplina_de_atendimento )
{
    
    this.array = [];        // Array que representa todos elementos dentro da fila (incluindo em serviço)
    this.disciplina = _disciplina_de_atendimento;   // "FCFS" ou "LCFS"

    //Insere uma pessoa na fila, levando em conta a disciplina
    this.push = function(newElement)
    {
        document.writeln("Entrada: " + newElement.tempoDeChegada )
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

    //Remove o elemento 0 da fila e o retorna.
    this.pop = function()
    {
        var served = this.array[0];
        document.writeln("Saida: " + served.tempoDeChegada )
        this.array.splice(0,1);
        return served;
    };

    //Retorna se a fila está vazia
    this.vazia = function()
    {
        return (this.array.length === 0);
    }
}

function Pessoa( tempoDeChegada , rodada ){
    this.tempoDeChegada = tempoDeChegada;
    this.rodada = rodada;
}