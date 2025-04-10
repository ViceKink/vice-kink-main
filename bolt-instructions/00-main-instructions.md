
# Vice Kink Mobile App - Main Instructions

## Project Overview

I'm rebuilding the Vice Kink social dating platform as a mobile application using Expo and React Native. This project aims to transform an existing web application into a fully-featured mobile experience while maintaining connection to the same Supabase backend.

## Why We're Rebuilding

The current web implementation has become complex and difficult to maintain. By rebuilding from scratch with Expo, we gain:

1. True native mobile experience with better performance
2. Cross-platform compatibility (iOS and Android)
3. Access to device features like camera, notifications, and location services
4. A cleaner, more maintainable codebase
5. The ability to publish to app stores

## Project Goals

1. Create a mobile-first experience that maintains all functionality of the web version
2. Connect to the existing Supabase backend for data consistency
3. Implement a clean architecture with focused components
4. Prioritize user experience with responsive design and smooth animations
5. Enable social connections through matching, messaging, and content sharing

## Process Overview

I'll be sharing detailed instructions in multiple sets (due to file upload limitations). These sets contain comprehensive guidance on:

1. **Set 1**: Project setup, tech stack, database structure, authentication systems
2. **Set 2**: Core features, UI components, screens and navigation 
3. **Set 3**: Data management, feature implementation, deployment guidelines

Each file provides detailed specifications, code examples, and implementation guidelines to rebuild the Vice Kink platform properly.

## Specific Implementation Requirements

Some critical implementation details to note:

1. **Profile Deletion**: When users delete their profile, we want to preserve their posts and comments but anonymize them by setting the user_id to null and displaying "Deleted User" with a default avatar.

2. **Text Formatting**: Ensure that text formatting (line breaks, paragraphs) is preserved in posts by using proper CSS (whitespace-pre-line) and appropriate rendering techniques.

3. **Authentication**: Use Supabase auth with secure token storage and session management.

4. **Real-time Features**: Implement chat functionality with real-time or efficient polling mechanisms.

Please confirm when you've reviewed each set of instructions, and let me know if you need clarification on any aspects before proceeding with implementation.
