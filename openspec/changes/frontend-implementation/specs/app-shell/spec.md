# App Shell Specification

## Purpose

Application layout skeleton: sidebar navigation, header bar, protected route structure, and responsive container that wraps all authenticated features.

## Requirements

### Requirement: Sidebar Navigation

The system SHALL render a sidebar with Nero (#1A1A1A) background, Construformas logo, and navigation links. Active link SHALL use Construction Red (#E63946) as background/highlight. All navigation items SHALL be shown (role-based filtering is deferred).

#### Scenario: Sidebar renders with brand styling

- GIVEN the user is authenticated and on a protected route
- WHEN the shell layout loads
- THEN the sidebar displays with Nero background and Construformas branding

#### Scenario: Active nav item highlighted

- GIVEN the user is on the "Clients" route
- WHEN the sidebar renders
- THEN the "Clients" nav item shows Construction Red as active indicator

### Requirement: Header Bar

The system SHALL render a header bar at the top of the content area showing: current user name, user role, and a logout button.

#### Scenario: Header displays user info

- GIVEN the user is authenticated
- WHEN the shell layout loads
- THEN the header shows the user's name and role

#### Scenario: Logout button clears session

- GIVEN the user is authenticated
- WHEN the user clicks the logout button in the header
- THEN tokens are cleared and the user is redirected to `/login`

### Requirement: Router Outlet

The system SHALL render a `<router-outlet>` in the content area between the sidebar and header for nested route content.

#### Scenario: Nested routes render in content area

- GIVEN the user navigates to a protected child route
- WHEN the shell layout is active
- THEN the child route component renders in the content area

### Requirement: Route Structure

The system SHALL configure routes: `/login` and `/register` as public routes; all other routes wrapped in a protected shell with auth guard.

#### Scenario: Public routes accessible without auth

- GIVEN no user is authenticated
- WHEN the user navigates to `/login` or `/register`
- THEN the page renders without redirection

#### Scenario: Root path redirects to shell

- GIVEN the user is authenticated
- WHEN they navigate to `/`
- THEN the system redirects to the default shell route

### Requirement: Responsive Layout

The system SHALL provide a responsive layout where the sidebar collapses to icons on screens below 1024px width and can be toggled open/closed on mobile.

#### Scenario: Sidebar collapses on tablet

- GIVEN the viewport width is below 1024px
- WHEN the shell renders
- THEN the sidebar shows only icons without text labels

#### Scenario: Sidebar toggles on mobile

- GIVEN the viewport width is below 768px
- WHEN the user taps the hamburger menu
- THEN the sidebar overlays the content area

### Requirement: Environment Configuration

The system SHALL read the API base URL from `environment.ts`. Development mode SHALL proxy `/api/*` requests to `localhost:8081` via `proxy.conf.json`.

#### Scenario: Dev proxy forwards API calls

- GIVEN the app runs in development mode
- WHEN an HTTP request targets `/api/auth/login`
- THEN the proxy forwards it to `localhost:8081/api/auth/login`
