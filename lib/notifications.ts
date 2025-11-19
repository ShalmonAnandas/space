type NotificationType = 'sutta_normal' | 'sutta_sos' | 'mood' | 'gossip' | 'frustration' | 
'gossip_reaction' | 'notice_seen' | 'vent';

type Payload = {
  name: string;
  mood?: string;
  frustration?: 'project' | 'junior' | 'resign';
  ventText?: string;
};

export function getNotificationText(type: NotificationType, payload: Payload) {
  const { name, mood, frustration, ventText } = payload;
  let variants: string[] = [];
  let title = 'Space';

  switch (type) {
    case 'sutta_normal':
      variants = [
        `${name} is on a sutta break.`,
        `${name} just stepped out for a smoke.`,
        `Sutta time for ${name}!`,
        `${name} is taking a smoke break.`,
        `Smoke break! ${name} stepped out.`,
        `${name} went for a quick sutta.`,
        `${name} needs a sutta moment.`,
        `${name} is having a cigarette break.`,
        `Quick sutta break for ${name}.`,
        `${name} stepped out for a smoke break.`,
      ];
      break;
    case 'sutta_sos':
      title = 'Partner SOS!';
      variants = [
        `SOS: ${name} is slipping and needs help!`,
        `Warning: ${name} is having a tough time. Check in?`,
        `SOS from ${name}! They're smoking again.`,
        `🚨 ${name} needs your support right now!`,
        `Red alert: ${name} is struggling. Time to reach out?`,
        `${name} could really use a friend right now.`,
        `Check on ${name}! They're having a rough moment.`,
        `${name} is sending an SOS. Be there for them?`,
        `Your partner ${name} needs you. Please check in!`,
        `${name} is going through it. Show some support?`,
      ];
      break;
    case 'mood':
      variants = [
        `${name} is feeling ${mood} right now.`,
        `Update: ${name}'s mood is ${mood}.`,
        `Just so you know, ${name} is feeling ${mood}.`,
        `${name}'s current mood: ${mood}`,
        `Heads up! ${name} is ${mood} today.`,
        `${name} just updated their mood to ${mood}.`,
        `Mood check: ${name} is feeling ${mood}.`,
        `${name} wants you to know they're ${mood}.`,
        `FYI: ${name}'s mood is ${mood} at the moment.`,
        `${name} is vibing ${mood} right now.`,
      ];
      break;
    case 'gossip':
      variants = [
        `${name} has new gossip for you!`,
        `You've got a new secret from ${name}.`,
        `${name} just spilled the tea...`,
        `☕ ${name} has some fresh tea to share!`,
        `Psst... ${name} has something juicy to tell you.`,
        `${name} dropped some gossip. Check it out!`,
        `Breaking news from ${name}!`,
        `${name} has the inside scoop for you.`,
        `Hot gossip alert from ${name}!`,
        `${name} is sharing some exclusive intel...`,
      ];
      break;
    case 'frustration':
      const frustrationVariants = {
        project: [
          `${name} wants to quit this project!`,
          `${name} is so done with this project right now.`,
          `This project is driving ${name} crazy!`,
          `${name} can't deal with this project anymore.`,
          `${name} is about to rage-quit this project.`,
          `${name} hates everything about this project today.`,
          `This project has ${name} on the edge!`,
          `${name} is one bug away from abandoning this project.`,
          `${name} is questioning all their life choices because of this project.`,
          `${name} officially declares war on this project!`,
        ],
        junior: [
          `${name} hates their junior right now.`,
          `${name}'s junior is testing their patience today.`,
          `${name} can't even with their junior right now.`,
          `${name}'s junior is pushing all the wrong buttons.`,
          `${name} is about to lose it because of their junior.`,
          `${name}'s junior is making them question everything.`,
          `${name} needs a break from their junior ASAP.`,
          `${name}'s junior is being extra difficult today.`,
          `${name} is counting down until their junior leaves.`,
          `${name}'s patience with their junior has officially expired.`,
        ],
        resign: [
          `${name} is thinking about resigning...`,
          `${name} is seriously considering quitting today.`,
          `${name} just wants to walk out and never come back.`,
          `${name} is updating their resume as we speak.`,
          `${name} is one bad meeting away from resigning.`,
          `${name} is done with this job. Like, really done.`,
          `${name} is fantasizing about their resignation letter.`,
          `${name} is checking job listings right now...`,
          `${name} has had enough and is ready to quit.`,
          `${name} is this close 🤏 to handing in their notice.`,
        ],
      };
      variants = frustrationVariants[frustration!];
      break;
    case 'notice_seen':
      variants = [
        `${name} read your notice!`,
        `${name} has seen your update.`,
        `Your notice was read by ${name}.`,
        `✓ ${name} just checked your notice.`,
        `${name} saw what you posted!`,
        `Your update caught ${name}'s attention.`,
        `${name} is now in the loop!`,
        `Message received by ${name}!`,
        `${name} has eyes on your notice.`,
        `Your notice didn't go unnoticed by ${name}!`,
      ];
      break;
    case 'vent':
      title = 'Partner Vent';
      variants = [ventText || `${name} needs to vent!`];
      break;
  }

  return {
    title,
    body: variants[Math.floor(Math.random() * variants.length)],
  };
}
