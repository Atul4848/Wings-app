import { parseDependencyTree, parseCircular, prettyCircular } from 'dpdm';

parseDependencyTree('./apps/header/src/index.tsx', {
  /* options, see below */
}).then(tree => {
  const circulars = parseCircular(tree);
  console.log(prettyCircular(circulars));
});
