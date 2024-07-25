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
    if (this.jogadorAtual === 'goat') {
      if (this.cabrasTabuleiro < 20) {
        if (this.tabuleiro[rowIndex][colIndex] === null) {
          this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
          this.cabrasTabuleiro++;
          moveu = true;
        }
      } else {
        if (this.tabuleiro[rowIndex][colIndex] === this.jogadorAtual) {
          this.pecaSelecionada = [rowIndex, colIndex];
        } else if (this.tabuleiro[rowIndex][colIndex] === null) {
          if (this.pecaSelecionada) {
            const distancia = this.distanciaEuclidiana(rowIndex, colIndex, this.pecaSelecionada[0], this.pecaSelecionada[1]);
            if (distancia === 1) {
              this.tabuleiro[this.pecaSelecionada[0]][this.pecaSelecionada[1]] = null;
              this.pecaSelecionada = null;
              this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
              moveu = true;
            }
          }
        }
      }
    } else {
      if (this.tabuleiro[rowIndex][colIndex] === this.jogadorAtual) {
        this.pecaSelecionada = [rowIndex, colIndex];
      } else if (this.tabuleiro[rowIndex][colIndex] === null) {
        if (this.pecaSelecionada) {
          const distancia = this.distanciaEuclidiana(rowIndex, colIndex, this.pecaSelecionada[0], this.pecaSelecionada[1]);
          if (distancia === 1) {
            this.tabuleiro[this.pecaSelecionada[0]][this.pecaSelecionada[1]] = null;
            this.pecaSelecionada = null;
            this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
            moveu = true;
          } else if (distancia === 2) {
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
    const direcoes = [
      [-1, -1], [-1, 0], [-1, 1], 
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
  
    for (let row = 0; row < this.tabuleiro.length; row++) {
      for (let col = 0; col < this.tabuleiro[row].length; col++) {
        if (this.tabuleiro[row][col] === 'tiger') {
          for (const [dRow, dCol] of direcoes) {
            const newRow = row + dRow;
            const newCol = col + dCol;
  
            if (newRow >= 0 && newRow < this.tabuleiro.length && newCol >= 0 && newCol < this.tabuleiro[row].length) {
              if (this.tabuleiro[newRow][newCol] === null) {
                return false;
              } else if (this.tabuleiro[newRow][newCol] === 'goat') {
                const jumpRow = newRow + dRow;
                const jumpCol = newCol + dCol;
                if (jumpRow >= 0 && jumpRow < this.tabuleiro.length && jumpCol >= 0 && jumpCol < this.tabuleiro[row].length) {
                  if (this.tabuleiro[jumpRow][jumpCol] === null) {
                    return false;
                  }
                }
              }
            }
          }
        }
      }
    }
    return true;
  }
  

  distanciaEuclidiana(x1: number, y1: number, x2: number, y2: number) {
    return Math.floor(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
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