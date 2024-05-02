import { test as base } from 'playwright-bdd';
import MCR from 'monocart-coverage-reports';
import coverageOptions from '../mcr.config';

export const test = base.extend<{
  autoTestFixture: string
}>({
  // add your fixtures here

  // https://playwright.dev/docs/test-fixtures
  autoTestFixture: [async ({ page }, use) => {

    const isChromium = test.info().project.name === 'chromium';

    // console.log('autoTestFixture setup...');
    // coverage API is chromium only
    if (isChromium) {
        await Promise.all([
            page.coverage.startJSCoverage({
                resetOnNavigation: false
            }),
            page.coverage.startCSSCoverage({
                resetOnNavigation: false
            })
        ]);
    }

    await use('autoTestFixture');

    // console.log('autoTestFixture teardown...');
    if (isChromium) {
        const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage()
        ]);
        const coverageList = [... jsCoverage, ... cssCoverage];
        // console.log(coverageList.map((item) => item.url));
        const mcr = MCR(coverageOptions);
        await mcr.add(coverageList);
    }

}, {
    scope: 'test',
    auto: true
}]

});