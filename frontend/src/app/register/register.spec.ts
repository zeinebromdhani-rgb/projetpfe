import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApiService } from '../services/api.service'; 

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent, // ✅ composant standalone
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        ApiService,
        provideHttpClient(withInterceptorsFromDi())
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
