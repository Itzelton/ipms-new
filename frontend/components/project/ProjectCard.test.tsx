import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectCard from './ProjectCard';

describe('ProjectCard', () => {
  it('renders project title and progress', () => {
    const project = { id: 'p1', title: 'Test Project', progress: 42, status: 'ACTIVE' };
    render(<ProjectCard project={project} role="STUDENT" />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });
});
