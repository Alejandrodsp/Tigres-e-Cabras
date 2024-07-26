import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  tabuleiro: (null | 'goat' | 'tiger')[][] = [
    ['tiger', null, null, null, 'tiger'],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    ['tiger', null, null, null, 'tiger'],
  ];
  jogador: (null | 'goat' | 'tiger') = null;
  jogadorAtual: 'goat' | 'tiger' = 'goat';
  pecaSelecionada: (null | [number, number]) = null;
  cabrasTabuleiro = 0;
  cabrasMortas = 0;
  vencedor: (null | 'goat' | 'tiger') = null;
  backgroundMusic = new Audio();
  movimentos_validos: { [key: string]: string[] } = {"0_0":["0_1","1_0","1_1"],"0_1":["0_2","0_0","1_1"],"0_2":["0_3","0_1","1_2","1_1","1_3"],"0_3":["0_4","0_2","1_3"],"0_4":["0_3","1_4","1_3"],"1_0":["1_1","2_0","0_0"],"1_1":["1_2","1_0","2_1","0_1","2_0","0_2","2_2","0_0"],"1_2":["1_3","1_1","2_2","0_2"],"1_3":["1_4","1_2","2_3","0_3","2_2","0_4","2_4","0_2"],"1_4":["1_3","2_4","0_4"],"2_0":["2_1","3_0","1_0","1_1","3_1"],"2_1":["2_2","2_0","3_1","1_1"],"2_2":["2_3","2_1","3_2","1_2","3_1","1_3","3_3","1_1"],"2_3":["2_4","2_2","3_3","1_3"],"2_4":["2_3","3_4","1_4","3_3","1_3"],"3_0":["3_1","4_0","2_0"],"3_1":["3_2","3_0","4_1","2_1","4_0","2_2","4_2","2_0"],"3_2":["3_3","3_1","4_2","2_2"],"3_3":["3_4","3_2","4_3","2_3","4_2","2_4","4_4","2_2"],"3_4":["3_3","4_4","2_4"],"4_0":["4_1","3_0","3_1"],"4_1":["4_2","4_0","3_1"],"4_2":["4_3","4_1","3_2","3_3","3_1"],"4_3":["4_4","4_2","3_3"],"4_4":["4_3","3_4","3_3"]};
  historico_movimentos: any = { 'goat': [], 'tiger': []};
  capturas_validas: { [key: string]: string[] } = {"0_0":["0_2","2_0","2_2"],"0_1":["0_3","2_1"],"0_2":["0_4","0_0","2_2","2_0","2_4"],"0_3":["0_1","2_3"],"0_4":["0_2","2_4","2_2"],"1_0":["1_2","3_0"],"1_1":["1_3","3_1","3_3"],"1_2":["1_4","1_0","3_2"],"1_3":["1_1","3_3","3_1"],"1_4":["1_2","3_4"],"2_0":["2_2","4_0","0_0","0_2","4_2"],"2_1":["2_3","4_1","0_1"],"2_2":["2_4","2_0","4_2","0_2","4_0","0_4","4_4","0_0"],"2_3":["2_1","4_3","0_3"],"2_4":["2_2","4_4","0_4","4_2","0_2"],"3_0":["3_2","1_0"],"3_1":["3_3","1_1","1_3"],"3_2":["3_4","3_0","1_2"],"3_3":["3_1","1_3","1_1"],"3_4":["3_2","1_4"],"4_0":["4_2","2_0","2_2"],"4_1":["4_3","2_1"],"4_2":["4_4","4_0","2_2","2_4","2_0"],"4_3":["4_1","2_3"],"4_4":["4_2","2_4","2_2"]};
  
  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.backgroundMusic.src = '../assets/background-music.mp3';
    this.backgroundMusic.load();
  }
  
  novoJogo() {
    this.tabuleiro = [
      ['tiger', null, null, null, 'tiger'],
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
      ['tiger', null, null, null, 'tiger'],
    ];
    this.jogador = null;
    this.jogadorAtual = 'goat';
    this.pecaSelecionada = null;
    this.cabrasTabuleiro = 0;
    this.cabrasMortas = 0;
    this.vencedor = null;
  }

  openModalVencedor() {
    const dialogRef = this.dialog.open(DialogVencedor, {
      data: {
        vencedor: this.vencedor,
        jogador: this.jogador
      },
    });

    dialogRef.afterClosed().subscribe(jogarNovamente => {
      if (jogarNovamente) this.novoJogo();
    });
  }

  selecionarModoJogo(modo: 'goat' | 'tiger') {
    this.jogador = modo;
    this.backgroundMusic.play();
  }

  realizarJogada(rowIndex: number, colIndex: number) {
    let moveu = false;

    const verificarMovimentoRepetido = (saida: string, destino: string): boolean => {
      const movimentosAnteriores = this.historico_movimentos[this.jogadorAtual];
      if (movimentosAnteriores.length === 0) {
        return false;
      }
      return movimentosAnteriores.some((movimento: { destino: string; saida: string; }) => movimento.destino === destino && movimento.saida === saida);
    };

    if (this.jogadorAtual === 'goat' && this.cabrasTabuleiro < 20) {
      // Jogada de cabra: Adiciona uma nova cabra ao tabuleiro
      if (this.tabuleiro[rowIndex][colIndex] === null) {
        this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
        this.cabrasTabuleiro++;
        moveu = true;
      }
    } else {
      // Jogada de tigre: Movimento ou captura
      if (this.tabuleiro[rowIndex][colIndex] === this.jogadorAtual) {
        this.pecaSelecionada = [rowIndex, colIndex];
      } else if (this.tabuleiro[rowIndex][colIndex] === null) {
        if (this.pecaSelecionada) {
          const capturas_validas_posicao = this.capturas_validas[`${this.pecaSelecionada[0]}_${this.pecaSelecionada[1]}`];
          const movimentos_validos_posicao = this.movimentos_validos[`${this.pecaSelecionada[0]}_${this.pecaSelecionada[1]}`];
          const saida = `${this.pecaSelecionada[0]}_${this.pecaSelecionada[1]}`;
          const destino = `${rowIndex}_${colIndex}`;

          if (movimentos_validos_posicao.find(movimento => movimento == destino)) {
            if (!verificarMovimentoRepetido(saida, destino)) {
              this.historico_movimentos[this.jogadorAtual].push({ saida, destino });

              if (this.historico_movimentos[this.jogadorAtual].length > 2) {
                this.historico_movimentos[this.jogadorAtual].shift();
              }

              this.tabuleiro[this.pecaSelecionada[0]][this.pecaSelecionada[1]] = null;
              this.pecaSelecionada = null;
              this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
              moveu = true;
            }
          } else if (capturas_validas_posicao.find(captura => captura == destino)) {
            const meioX = (rowIndex + this.pecaSelecionada[0]) / 2;
            const meioY = (colIndex + this.pecaSelecionada[1]) / 2;
            if (this.tabuleiro[meioX][meioY] === 'goat') {
              this.tabuleiro[meioX][meioY] = null;
              this.tabuleiro[this.pecaSelecionada[0]][this.pecaSelecionada[1]] = null;
              this.pecaSelecionada = null;
              this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
              moveu = true;
              this.cabrasMortas++;
            }
          }
        }
      }
    }

    if (moveu) {
      this.jogadorAtual = this.jogadorAtual === 'tiger' ? 'goat' : 'tiger';
      this.verificaVencedor();
    }
  }

  verificaVencedor() {
    if (this.cabrasMortas === 5) {
      this.vencedor = 'tiger';
    } else if(this.todosTigresImobilizados()) {
      this.vencedor = 'goat';
    }

    if (this.vencedor) {
      this.openModalVencedor();
    }
  }

  todosTigresImobilizados(): boolean {
    const tigres = [];
    
    for (let i = 0; i < this.tabuleiro.length; i++) {
      for (let j = 0; j < this.tabuleiro[i].length; j++) {
        if (this.tabuleiro[i][j] === 'tiger') {
          tigres.push([i, j]);
        }
      }
    }
  
    for (const [x, y] of tigres) {
      const posicao = `${x}_${y}`;
      const movimentos = this.movimentos_validos[posicao] || [];
      const capturas = this.capturas_validas[posicao] || [];
  
      for (const movimento of movimentos) {
        const [novoX, novoY] = movimento.split('_').map(Number);
        if (this.tabuleiro[novoX][novoY] === null) {
          return false;
        }
      }
  
      for (const captura of capturas) {
        const [novoX, novoY] = captura.split('_').map(Number);
        const meioX = (x + novoX) / 2;
        const meioY = (y + novoY) / 2;
        if (this.tabuleiro[novoX][novoY] === null && this.tabuleiro[meioX][meioY] === 'goat') {
          return false;
        }
      }
    }
  
    return true;
  }

  mutarMusica() {
    this.backgroundMusic.muted ? this.backgroundMusic.muted = false : this.backgroundMusic.muted = true;
  }
}

@Component({
  selector: 'dialog-vencedor',
  templateUrl: 'dialog-vencedor.html',
  styleUrls: ['./app.component.scss']
})
export class DialogVencedor {
  public vencedor: any;
  public jogador: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.vencedor = data.vencedor;
    this.jogador = data.jogador;
  }
}