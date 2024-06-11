import Startpage from '@/app/startpage/page';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';


describe('Home', () => {
  it('renders a h2 that says Use AI to find a movie!', () => {
    // Render the Home component
    render(<Startpage/>);

    // Check if the h2 with text Use AI to find a movie! is rendered
    const h2 = screen.getByText('Use AI to find a movie!');
    expect(h2).toBeInTheDocument();
  });
});