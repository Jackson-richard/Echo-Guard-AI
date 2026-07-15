# EchoGuard AI — Frontend Architecture

> **Version:** 1.0.0 | **Stack:** React 18 + Vite + TailwindCSS

---

## 1. Design System

### 1.1 Color Palette
| Token | Hex | Usage |
|---|---|---|
| `bg-primary` | `#0B1220` | App background |
| `bg-card` | `#111827` | Card surfaces |
| `bg-card-hover` | `#1F2937` | Card hover states |
| `accent` | `#00E5FF` | Primary accent, links, active states |
| `accent-glow` | `#00E5FF33` | Glassmorphism glow |
| `danger` | `#FF4D4F` | Critical alerts, destructive actions |
| `warning` | `#FBBF24` | Warnings, medium severity |
| `success` | `#22C55E` | Success states, high trust |
| `text-primary` | `#F9FAFB` | Primary text |
| `text-secondary` | `#9CA3AF` | Secondary/muted text |
| `border` | `#1F2937` | Card/component borders |

### 1.2 Typography
- **Font:** Inter (Google Fonts)
- **Headings:** 600–700 weight
- **Body:** 400 weight
- **Mono:** JetBrains Mono (data, scores, IDs)

### 1.3 Spacing Scale
- 4px grid system: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

### 1.4 Border Radius
- Cards: `12px` | Buttons: `8px` | Inputs: `8px` | Badges: `9999px`

### 1.5 Glassmorphism Recipe
```css
background: rgba(17, 24, 39, 0.7);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

---

## 2. Layout Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      TOP NAVBAR (h-16)                      │
│  [≡ Toggle]  [Breadcrumbs]          [🔔 Notif] [👤 Profile]│
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ SIDEBAR  │              MAIN CONTENT AREA                   │
│ (w-64)   │              (scrollable)                        │
│          │                                                   │
│ Logo     │   ┌──────────────────────────────────────────┐   │
│ Nav      │   │          PAGE CONTENT                     │   │
│ Items    │   │                                           │   │
│          │   │                                           │   │
│          │   └──────────────────────────────────────────┘   │
│          │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

### Responsive Behavior
| Breakpoint | Sidebar | Navbar |
|---|---|---|
| `≥1280px` (xl) | Expanded (w-64) | Full |
| `≥768px` (md) | Collapsed (w-20, icons only) | Full |
| `<768px` (sm) | Hidden, overlay on toggle | Hamburger menu |

---

## 3. Navigation Flow

```
/login ─────────────────┐
/register ──────────────┤
                        ▼
              ┌── Auth Gate ──┐
              │               │
              ▼               ▼
     /voice-enrollment    /dashboard ──┬── /live-monitoring
                                       ├── /behavior
                                       ├── /deepfake
                                       ├── /threats
                                       ├── /incidents
                                       ├── /notifications
                                       ├── /blocked-sessions
                                       ├── /users
                                       ├── /roles
                                       ├── /settings
                                       ├── /profile
                                       └── /* → /404
```

---

## 4. State Management (Context API)

| Context | State | Consumers |
|---|---|---|
| `AuthContext` | user, token, isAuthenticated, login(), logout() | All protected pages |
| `SocketContext` | socket instance, connected status, event handlers | Live pages |
| `ThemeContext` | theme (dark/light), toggleTheme() | All components |
| `NotificationContext` | notifications[], unreadCount, markRead() | Navbar, NotificationPanel |
| `SidebarContext` | isCollapsed, toggle() | Layout, Sidebar |
| `TrustContext` | trustScore, trustLevel, history | Dashboard, Live, Trust widget |

---

## 5. Animation Strategy (Framer Motion)

| Element | Animation | Duration |
|---|---|---|
| Page transitions | Fade + slide up | 300ms |
| Cards mount | Stagger fade-in | 50ms stagger |
| Trust gauge | Spring counter | 600ms |
| Alert toast | Slide from right | 200ms |
| Sidebar toggle | Width tween | 200ms |
| Modal | Scale + fade | 200ms |
| Charts | Draw-in on mount | 500ms |
| Hover effects | Scale 1.02 | 150ms |
