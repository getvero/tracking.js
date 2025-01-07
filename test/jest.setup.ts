import { manageFetchMockGlobally } from '@fetch-mock/jest';
import type { Jest } from '@jest/environment';

manageFetchMockGlobally(jest as Jest);
