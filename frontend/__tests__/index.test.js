import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import FirstPage from '@/app/firstpage/page';
 

describe('FirstPage', () => {
  it('renders a "Log in" button when the user is not logged in', () => {
    // Render the Home component
    render(<FirstPage />);

    // Check if the "Log In" button is rendered
    const logInButton = screen.getByText('Log in');
    expect(logInButton).toBeInTheDocument();
  });
});