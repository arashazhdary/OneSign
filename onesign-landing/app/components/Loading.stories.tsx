import type { Meta, StoryObj } from '@storybook/react';
import {
  Skeleton,
  TextSkeleton,
  CardSkeleton,
  TableSkeleton,
  AvatarSkeleton,
  ButtonSkeleton,
  Spinner,
  PageLoader,
  ContentLoader,
  InlineLoader,
} from './Loading';

const meta = {
  title: 'Components/Loading',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const SkeletonDemo: StoryObj = {
  render: () => (
    <div className="space-y-4 w-96">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};

export const TextSkeletonDemo: StoryObj = {
  render: () => (
    <div className="w-96">
      <TextSkeleton lines={5} />
    </div>
  ),
};

export const CardSkeletonDemo: StoryObj = {
  render: () => (
    <div className="w-96">
      <CardSkeleton />
    </div>
  ),
};

export const TableSkeletonDemo: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <TableSkeleton rows={5} />
    </div>
  ),
};

export const AvatarSkeletonDemo: StoryObj = {
  render: () => <AvatarSkeleton />,
};

export const ButtonSkeletonDemo: StoryObj = {
  render: () => <ButtonSkeleton />,
};

export const SpinnerSmall: StoryObj = {
  render: () => <Spinner size="sm" />,
};

export const SpinnerMedium: StoryObj = {
  render: () => <Spinner size="md" />,
};

export const SpinnerLarge: StoryObj = {
  render: () => <Spinner size="lg" />,
};

export const PageLoaderDemo: StoryObj = {
  render: () => (
    <div className="w-96 h-96">
      <PageLoader />
    </div>
  ),
};

export const ContentLoaderDemo: StoryObj = {
  render: () => (
    <div className="w-96 h-96">
      <ContentLoader />
    </div>
  ),
};

export const InlineLoaderDemo: StoryObj = {
  render: () => <InlineLoader />,
};
