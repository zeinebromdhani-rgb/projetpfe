import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

// Services
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { ValidationService } from '../services/validation.service';
import { RoleService } from '../services/role.service';

// Models
import { UserWithRole } from '../models/user-with-role.model';
import { UserRole } from '../models/user-role.enum';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRoleService: jasmine.SpyObj<RoleService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: UserWithRole = {
    id: 1,
    name: 'Admin',
    email: 'admin@monsite.com',
    role: UserRole.ADMIN,
    permissions: ['DASHBOARD_ACCESS']
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login']);
    mockRoleService = jasmine.createSpyObj('RoleService', ['getUserInfo', 'setCurrentUserRole']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule
      ],
      declarations: [LoginComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        FormBuilder,
        ApiService,
        ValidationService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: {} }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should redirect admin user to /admin-dashboard after login', fakeAsync(() => {
    component.loginForm.setValue({ email: 'admin@monsite.com', password: 'admin123' });

    // Correction : Simule un Observable qui retourne true
    mockAuthService.login.and.returnValue(of(true));

    // Correction : Simule un Observable qui retourne un UserWithRole
    mockRoleService.getUserInfo.and.returnValue(of(mockUser));

    component.onSubmit();
    tick(); // simulate async

    // Vérification que le rôle est bien défini
    expect(mockRoleService.setCurrentUserRole).toHaveBeenCalledWith(UserRole.ADMIN);

    // Vérifie qu'on redirige vers le bon dashboard
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
  }));
});
