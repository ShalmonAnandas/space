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
      ];
      break;
    case 'mood':
      variants = [
        `${name} is feeling ${mood} right now.`,
        `Update: ${name}'s mood is ${mood}.`,
        `Just so you know, ${name} is feeling ${mood}.`,
      ];
      break;
    case 'gossip':
      variants = [
        `${name} has new gossip for you!`,
        `You've got a new secret from ${name}.`,
        `${name} just spilled the tea...`,
      ];
      break;
    case 'frustration':
      const textMap = {
        project: `${name} wants to quit this project!`,
        junior: `${name} hates their junior right now.`,
        resign: `${name} is thinking about resigning...`,
      };
      variants = [textMap[frustration!]];
      break;
    case 'notice_seen':
      variants = [
        `${name} read your notice!`,
        `${name} has seen your update.`,
        `Your notice was read by ${name}.`,
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
