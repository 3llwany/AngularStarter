import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-starter-home-page',
  imports: [TranslatePipe],
  templateUrl: './starter-home.page.html',
})
export class StarterHomePageComponent {}
