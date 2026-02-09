const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const k8s = require('@kubernetes/client-node');

// Kubernetes client setup
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const k8sHelper = {
  // Install Helm chart
  installStore: async (helmRelease, namespace, storeName) => {
    try {
      // Use absolute path to the Helm chart
      const chartPath = 'C:\\Users\\hp1\\OneDrive\\Desktop\\Urumi\\woocommerce-store';
      
      const command = `helm install ${helmRelease} "${chartPath}" --set namespace=${namespace} --set storeName="${storeName}"`;
      
      console.log(`[HELM] Executing: ${command}`);
      
      const { stdout, stderr } = await execPromise(command, { 
        shell: 'powershell.exe',
        cwd: 'C:\\Users\\hp1\\OneDrive\\Desktop\\Urumi'
      });
      
      console.log('[HELM] Success! Output:', stdout);
      
      if (stderr && !stderr.includes('WARNING')) {
        console.warn('[HELM] Warnings:', stderr);
      }
      
      return { success: true, output: stdout };
    } catch (error) {
      console.error('[HELM] Install failed!');
      console.error('[HELM] Error message:', error.message);
      if (error.stderr) {
        console.error('[HELM] Error output:', error.stderr);
      }
      throw error;
    }
  },

  // Uninstall Helm chart
  uninstallStore: async (helmRelease) => {
    try {
      const command = `helm uninstall ${helmRelease}`;
      
      console.log(`[HELM] Executing: ${command}`);
      
      const { stdout, stderr } = await execPromise(command, {
        shell: 'powershell.exe'
      });
      
      console.log('[HELM] Uninstall success:', stdout);
      
      return { success: true, output: stdout };
    } catch (error) {
      console.error('[HELM] Uninstall error:', error.message);
      throw error;
    }
  },

  // Check if namespace exists and get pod status
  getNamespaceStatus: async (namespace) => {
    try {
      // Check if namespace exists
      if (!namespace) {
        return { exists: false, status: 'Error', message: 'Namespace name is required' };
      }
      await k8sApi.readNamespace(namespace);
      
      // Get pods in namespace
      const podsResponse = await k8sApi.listNamespacedPod(namespace);
      const pods = podsResponse.body.items;
      
      if (pods.length === 0) {
        return { exists: true, podCount: 0, allPodsReady: false, status: 'Provisioning' };
      }
      
      // Check if all pods are running
      const allRunning = pods.every(pod => 
        pod.status.phase === 'Running' &&
        pod.status.containerStatuses?.every(c => c.ready)
      );
      
      return {
        exists: true,
        podCount: pods.length,
        allPodsReady: allRunning,
        status: allRunning ? 'Ready' : 'Provisioning'
      };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return { exists: false, status: 'NotFound' };
      }
      console.error('[K8S] Error checking namespace:', error.message);
      return { exists: false, status: 'Error' };
    }
  },

  // List all Helm releases
  listHelmReleases: async () => {
    try {
      const { stdout } = await execPromise('helm list --output json', {
        shell: 'powershell.exe'
      });
      return JSON.parse(stdout);
    } catch (error) {
      console.error('[HELM] Error listing releases:', error.message);
      return [];
    }
  }
};

module.exports = k8sHelper;