function About() {
  const teamMembers = [
    {
      id: 1,
      name: 'Veronika',
      role: 'Team Lead',
      bio: '3nd year student. In the project, I combine the roles of organizer and coder - I distribute tasks, monitor deadlines and write code at the same time. When not at the computer, I dance or play the piano, because life should be multifaceted!',
      github: 'https://github.com/Veronika-Kashlej',
    },
    {
      id: 2,
      name: 'Vlad',
      role: 'Frontend Developer',
      bio: 'Vlad holds a Bachelor"s degree from Moscow Institute of Electronic Technology (2023). He is proficient in English at B2 level and has intermediate German skills at A2/B1 level. Responsible for implementing the complete Firebase infrastructure. He developed the secure authentication system.',
      github: 'https://github.com/Vlad-Vasinev',
    },
    {
      id: 3,
      name: 'Kirill',
      role: 'Frontend Developer',
      bio: 'More than twenty years in leadership positions in various business projects, English B1-B2, Spanish B1, experience in 1C and website development. In the project, he proved that you can work equally confidently with both building architecture and application architecture.',
      github: 'https://github.com/KirrBrest',
    },
  ];

  return (
    <div className="about-container">
      <div className="about-header">
        <h2>Our Development Team</h2>
        <p className="team-description">
          We are a passionate team of developers who came together through the RS School program.
          Our diverse skills and collaborative approach allowed us to create a product we&lsquo;re
          proud of. Each of us contributed something of our own: one thought through the logic,
          another followed the design, the third optimized the performance. The result was a project
          in which we invested knowledge, time and, of course, a couple of sleepless nights before
          the deadlines.
        </p>
      </div>

      <div className="team-members">
        {teamMembers.map((member) => (
          <div key={member.id} className="team-member-card">
            <h2>{member.name}</h2>
            <h3>{member.role}</h3>
            <p className="member-bio">{member.bio}</p>
            <a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              GitHub Profile
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default About;
