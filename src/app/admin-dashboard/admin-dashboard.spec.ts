import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard';
import { RoleService, UserRole, UserWithRole } from '../services/role.service';
import { Component } from '@angular/core';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;

  const mockUser: UserWithRole = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: UserRole.USER,
  permissions: ['dashboard:view', 'metrics:view']
};



  beforeEach(async () => {
    const spy = jasmine.createSpyObj('RoleService', ['getAllUsers', 'updateUserRole']);

    await TestBed.configureTestingModule({
      declarations: [AdminDashboardComponent],
      providers: [{ provide: RoleService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    roleServiceSpy = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    const users: UserWithRole[] = [mockUser];
    roleServiceSpy.getAllUsers.and.returnValue(users);

    component.ngOnInit();

    expect(component.allUsers).toEqual(users);
    expect(roleServiceSpy.getAllUsers).toHaveBeenCalled();
  });

  it('should promote a user to admin and show success alert', () => {
    spyOn(window, 'alert');
    roleServiceSpy.updateUserRole.and.returnValue(true);
    roleServiceSpy.getAllUsers.and.returnValue([mockUser]); // refresh after promotion

    component.promoteToAdmin(mockUser);

    expect(roleServiceSpy.updateUserRole).toHaveBeenCalledWith(1, UserRole.ADMIN);
    expect(window.alert).toHaveBeenCalledWith(`${mockUser.name} est maintenant administrateur !`);
  });

  it('should show error alert when promotion fails', () => {
    spyOn(window, 'alert');
    roleServiceSpy.updateUserRole.and.returnValue(false);

    component.promoteToAdmin(mockUser);

    expect(window.alert).toHaveBeenCalledWith('Permission refusée.');
  });

  it('should demote a user to USER and show success alert', () => {
    spyOn(window, 'alert');
    roleServiceSpy.updateUserRole.and.returnValue(true);
    roleServiceSpy.getAllUsers.and.returnValue([mockUser]); // refresh after demotion

    component.demoteToUser(mockUser);

    expect(roleServiceSpy.updateUserRole).toHaveBeenCalledWith(1, UserRole.USER);
    expect(window.alert).toHaveBeenCalledWith(`${mockUser.name} est maintenant un simple utilisateur.`);
  });

  it('should show error alert when demotion fails', () => {
    spyOn(window, 'alert');
    roleServiceSpy.updateUserRole.and.returnValue(false);

    component.demoteToUser(mockUser);

    expect(window.alert).toHaveBeenCalledWith('Permission refusée.');
  });
});
