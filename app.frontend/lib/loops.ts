import { LoopsClient } from 'loops';

export const transactionalEmailIds = {
  loginVerificationRequest: '',
  memberAcceptedInvitation: '',
  subscriptionCancelled: '',
  subscriptionCreatedPremium: '',
  subscriptionCreatedTeam: '',
  invitationToTeam: '',
};

import axios from 'axios';

export const createLoopsClient = () => {
  if (!process.env.LOOPS_API_KEY) {
    console.warn('LOOPS API KEY is not set');
    return null;
  }

  return new LoopsClient(process.env.LOOPS_API_KEY);
};

export const saveEmail = async (emailAddress: string, content: string) => {
  try {
    const response = await axios.post('http://vendure-dev.innity.com.my:3003/api/save-email', {
      emailAddress: emailAddress,
      content: content,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};