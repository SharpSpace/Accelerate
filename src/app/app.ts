import { Component, OnInit } from '@angular/core';
import { LogService } from '../services/LogService.service';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Workshop } from '../models/workshop';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule
    ],
    providers: [
        LogService
    ],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})

export class App implements OnInit {
    workshops: Workshop[] = [];
    logs: string[] = [];
    logData: any[] = [];

    selectedWorkshopId: number = 0;
    selectedLog: string = '';
    loading = false;

    displayedColumns = ['timestamp', 'sensor', 'value'];

    constructor(private logService: LogService) { }

    ngOnInit() {
        this.logService.getWorkshops().subscribe(data => {
            this.workshops = data;
        });
    }

    onWorkshopChange() {
        const selectedWorkshop = this.workshops.find(ws => ws.id === this.selectedWorkshopId);

        if (selectedWorkshop && selectedWorkshop.id !== undefined) {
            this.logs = (selectedWorkshop.logs || []).map(log => {
                if (/^\d{8}$/.test(log)) {
                    return `${log.substring(0, 4)}-${log.substring(4, 6)}-${log.substring(6, 8)}`;
                }
                return log;
            });
        }
    }

    onLogChange() {
        this.loadLogData();
    }

    loadLogData() {
        this.loading = true;
        const selectedWorkshop = this.workshops.find(ws => ws.id === this.selectedWorkshopId);

        if (selectedWorkshop && selectedWorkshop.id !== undefined) {
            this.logService.getLogsByWorkshop(selectedWorkshop.id, this.selectedLog).subscribe(data => {
                this.logData = [];
                this.parceRawData(data.rawData);

                this.logData.sort((a, b) => (b.timestamp as Date).getTime() - (a.timestamp as Date).getTime());

                this.loading = false;
            }, err => {
                this.loading = false;
                console.error(err);
            });
        }
    }

    parceRawData(rawData: string) {
        rawData.split('\n').forEach((line: string) => this.parceLine(line));
    }

    parceLine(line: string) {
        if (!line.trim()) return;

        const sensor = line.substring(22, 50).trim();

        if (sensor.startsWith('T_Spike Load..Gas') || sensor.startsWith('T_Paddle Load..Gas')) {
            const timestamp = line.substring(0, 19).trim();
            const values = line
                .replace(timestamp, '')
                .trim()
                .substring(1)
                .replace('T_Spike Load..Gas', '')
                .replace('T_Paddle Load..Gas', '')
                .trim()
                .split('  ');

            this.logData.push({
                timestamp: new Date(timestamp),
                sensor: sensor.startsWith('T_Spike Load..Gas') ? 'T_Spike' : 'T_Paddle',
                value: values
            });
        }
    }
}