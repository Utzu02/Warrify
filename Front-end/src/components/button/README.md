# Button Component

A standardized, reusable button component for the Warrify application. All buttons follow the design pattern of the login button with consistent styling, border radius, and colors.

## Usage

```tsx
import Button from '../components/button';

// Primary button
<Button variant="primary" size="medium">
  Click me
</Button>

// Button with Link (react-router)
<Button to="/dashboard" variant="primary">
  Go to Dashboard
</Button>

// Button with external link
<Button href="https://example.com" variant="secondary">
  Learn More
</Button>

// Button with icon
<Button 
  variant="primary" 
  leftIcon={<IconComponent />}
>
  With Icon
</Button>

// Loading state
<Button variant="primary" loading={true}>
  Submit
</Button>

// Full width
<Button variant="primary" fullWidth>
  Full Width Button
</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Button text/content |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Button style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `fullWidth` | `boolean` | `false` | Makes button full width |
| `disabled` | `boolean` | `false` | Disables the button |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `leftIcon` | `React.ReactNode` | - | Icon on the left side |
| `rightIcon` | `React.ReactNode` | - | Icon on the right side |
| `onClick` | `(e: React.MouseEvent) => void` | - | Click handler (for button) |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `className` | `string` | - | Additional CSS classes |
| `to` | `string` | - | react-router Link path |
| `href` | `string` | - | External link URL |

## Variants

### Primary
Default blue button based on login button style
- Background: `#1e66f5`
- Border radius: `12px`
- Hover: Darker blue with lift effect

### Secondary
Light gray button for secondary actions
- Background: `#f1f5f9`
- Border: `1px solid #e2e8f0`

### Ghost
Transparent button with border
- Background: Transparent
- Border: `2px solid #1e66f5`

### Danger
Red button for destructive actions
- Background: `#ef4444`

## Sizes

- **Small**: `padding: 0.5rem 1rem`, `font-size: 0.875rem`, `border-radius: 8px`
- **Medium**: `padding: 0.875rem 1.5rem`, `font-size: 1rem`, `border-radius: 12px`
- **Large**: `padding: 1rem 2rem`, `font-size: 1.05rem`, `border-radius: 12px`

## Components Updated

The following components have been updated to use the new Button component:

- Home: `HomeHero`, `HomeCTA`
- Auth: `LoginForm`, `RegisterForm`
- Pages: `NotLoggedIn`, `GmailConfig`
- About: `AboutCTA`
- Dashboard: `DashboardHero`
- Contact: `ContactForm`
- Pricing: `PricingColumns`, `PricingFreeTier`, `PriceCalculator`
- Modals: `GmailConfigModal`

## Notes

- The component automatically handles Link (internal navigation) vs href (external links) vs button (actions)
- Loading state automatically shows a spinner and disables the button
- Focus states follow accessibility best practices
- Responsive design ensures buttons work well on mobile devices
