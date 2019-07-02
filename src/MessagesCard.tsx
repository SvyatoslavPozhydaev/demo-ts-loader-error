import React, { PureComponent } from 'react';
import { MessagesItem } from './types';

interface MessagesCardProps extends MessagesItem {}

interface MessagesCardState {}

export class MessagesCard extends PureComponent<MessagesCardProps, MessagesCardState> {
  render() {
	const { title } = this.props;
    return (
		<div>
			{ title }
		</div>
	);
  }
}