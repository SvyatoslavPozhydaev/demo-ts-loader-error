import React, { PureComponent } from 'react';
import { MessagesCard } from './MessagesCard';

export class App extends PureComponent {
  render() {
    return <MessagesCard title="test title" />;
  }
}
