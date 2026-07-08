import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { SharedModule } from '../../shared/shared.module';
import { ActivityManagementComponent } from './activity-management/activity-management.component';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { NotificationsAdminComponent } from './notifications-admin/notifications-admin.component';
import { QrCodesComponent } from './qr-codes/qr-codes.component';

const routes: Routes = [
  { path: '', redirectTo: 'monitoring', pathMatch: 'full' },
  { path: 'activities', component: ActivityManagementComponent },
  { path: 'monitoring', component: MonitoringComponent },
  { path: 'notifications', component: NotificationsAdminComponent },
  { path: 'qr-codes', component: QrCodesComponent }
];

@NgModule({
  declarations: [
    ActivityManagementComponent,
    MonitoringComponent,
    NotificationsAdminComponent,
    QrCodesComponent
  ],
  imports: [SharedModule, QRCodeModule, RouterModule.forChild(routes)]
})
export class AdminModule {}
