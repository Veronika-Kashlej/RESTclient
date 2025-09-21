'use client';
import { useTranslations } from 'next-intl';

function About() {
  const t = useTranslations('about');

  const teamMembers = [
    {
      id: 1,
      name: 'Veronika',
      role: t('teamLead'),
      bio: t('veronikaBio'),
      github: 'https://github.com/Veronika-Kashlej',
    },
    {
      id: 2,
      name: 'Vlad',
      role: t('frontendDeveloper'),
      bio: t('vladBio'),
      github: 'https://github.com/Vlad-Vasinev',
    },
    {
      id: 3,
      name: 'Kirill',
      role: t('frontendDeveloper'),
      bio: t('kirillBio'),
      github: 'https://github.com/KirrBrest',
    },
  ];

  return (
    <div className="about-container">
      <div className="about-header">
        <h2>{t('title')}</h2>
        <p className="team-description">{t('description')}</p>
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
              {t('githubProfile')}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default About;
