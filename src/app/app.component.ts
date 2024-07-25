import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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
  
  constructor() {}

  selecionarModoJogo(modo: 'goat' | 'tiger') {
    this.jogador = modo;
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
      }
    } else {
      if (this.tabuleiro[rowIndex][colIndex] === this.jogadorAtual) {
        this.pecaSelecionada = [rowIndex, colIndex];
      } else if (this.tabuleiro[rowIndex][colIndex] === null) {
        if (this.pecaSelecionada) {
          this.tabuleiro[this.pecaSelecionada[0]][this.pecaSelecionada[1]] = null;
          this.pecaSelecionada = null;
          this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
          moveu = true;
        }
      }
    }
    if (moveu == true) this.jogadorAtual = this.jogadorAtual === 'tiger' ? 'goat' : 'tiger';
  }
}
