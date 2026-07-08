import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { OpportunitiesComponent } from './opportunities/opportunities.component';
import { MyRegistrationComponent } from './my-registration/my-registration.component';
import { CheckInComponent } from './check-in/check-in.component';

const routes: Routes = [
  { path: '', redirectTo: 'opportunities', pathMatch: 'full' },
  { path: 'opportunities', component: OpportunitiesComponent },
  { path: 'my-registration', component: MyRegistrationComponent },
  { path: 'check-in', component: CheckInComponent }
];

@NgModule({
  declarations: [OpportunitiesComponent, MyRegistrationComponent, CheckInComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class EmployeeModule {}
