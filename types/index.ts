export interface Person {
  id: string;
  name: string;
}

export interface Assignment {
  giverId: string;
  giverName: string;
  receiverId: string;
  receiverName: string;
}

export type AddMode = 'single' | 'multiple';

